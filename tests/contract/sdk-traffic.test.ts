import { describe, expect, test } from 'bun:test';

import { createHanaMusicApi } from '../../index.ts';

const lyricBody = { code: 200, lrc: { lyric: '' } };

describe('SDK outbound traffic', () => {
  test('concurrent calls from one listener all reach the upstream at once', async () => {
    let active = 0;
    let peak = 0;
    const hana = createHanaMusicApi({
      cookie: 'MUSIC_U=busy-listener',
      fetcher: async () => {
        active += 1;
        peak = Math.max(peak, active);
        await Bun.sleep(50);
        active -= 1;
        return Response.json(lyricBody);
      },
    });

    const responses = await Promise.all(
      Array.from({ length: 24 }, (_, index) =>
        hana.lyric({ id: String(index) }),
      ),
    );

    expect(responses.map((response) => response.status)).toEqual(
      Array.from({ length: 24 }, () => 200),
    );
    expect(peak).toBe(24);
  });

  test('an upstream 429 goes back to the caller without holding back later calls', async () => {
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return calls === 1
        ? Response.json(
            { code: 429 },
            { status: 429, headers: { 'Retry-After': '30' } },
          )
        : Response.json(lyricBody);
    };
    const limited = createHanaMusicApi({
      cookie: 'MUSIC_U=limited-listener',
      fetcher,
    });
    const other = createHanaMusicApi({
      cookie: 'MUSIC_U=other-listener',
      fetcher,
    });

    expect(limited.lyric({ id: '1' })).rejects.toMatchObject({
      status: 429,
      body: { retryAfter: 30 },
    });
    expect(await other.lyric({ id: '2' })).toMatchObject({ status: 200 });
    expect(await limited.lyric({ id: '3' })).toMatchObject({ status: 200 });
    expect(calls).toBe(3);
  });

  test('an upstream 405 rate limit is returned once with its original status', async () => {
    let calls = 0;
    const hana = createHanaMusicApi({
      cookie: 'MUSIC_U=limited-listener',
      retry: {
        backoffMs: 0,
        jitter: false,
        retries: 2,
        retryNonIdempotent: true,
        statusCodes: [405],
      },
      fetcher: async () => {
        calls += 1;
        return Response.json(
          { code: 405, msg: '操作过于频繁，请稍后再试' },
          { status: 405, headers: { 'Retry-After': '4' } },
        );
      },
    });

    const failure = await hana
      .lyric({ id: '1' })
      .catch((error: unknown) => error);
    expect(failure).toMatchObject({
      status: 405,
      body: {
        code: 405,
        retryAfter: 4,
      },
    });
    expect(calls).toBe(1);
  });

  test('an HTTP 200 response with business code 405 is not a rate limit', async () => {
    const hana = createHanaMusicApi({
      cookie: 'MUSIC_U=ordinary-error',
      fetcher: async () =>
        Response.json({ code: 405, msg: '操作过于频繁，请稍后再试' }),
    });

    const failure = await hana
      .lyric({ id: '1' })
      .catch((error: unknown) => error);
    expect(failure).toMatchObject({
      status: 405,
      body: {
        code: 405,
      },
    });
    expect(failure).not.toMatchObject({
      body: {
        retryAfter: expect.any(Number),
      },
    });
  });
});
