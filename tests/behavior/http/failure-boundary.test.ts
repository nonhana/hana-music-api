import { expect, test } from 'bun:test';

import type { FetchLike } from '../../../index.ts';
import { createServer } from '../../../src/server/create-server.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';

const request = async (fetcher: FetchLike) => {
  const app = await createServer(
    {},
    { execution: { fetcher, entropy: testEntropy } },
  );
  return app.request('/album?id=1');
};

const jsonBody = async (response: Response) => {
  const body = (await response.json()) as Record<string, unknown>;
  expect('failure' in body).toBe(false);
  return body;
};

test('HTTP keeps business rejections as the upstream body and status', async () => {
  const response = await request(async () =>
    Response.json({ code: 301, msg: '需要登录' }),
  );
  expect(response.status).toBe(301);
  expect(await jsonBody(response)).toEqual({ code: 301, msg: '需要登录' });
});

test('HTTP keeps transport rejections separate from business bodies', async () => {
  const response = await request(async () => {
    throw new Error('gateway');
  });
  expect(response.status).toBe(502);
  expect(await jsonBody(response)).toEqual({ code: 502, msg: 'gateway' });
});

test('HTTP keeps rate-limit status, body and Retry-After', async () => {
  const response = await request(async () =>
    Response.json(
      { code: 429, msg: 'limited' },
      { status: 429, headers: { 'Retry-After': '12' } },
    ),
  );
  expect(response.status).toBe(429);
  expect(response.headers.get('retry-after')).toBe('12');
  expect(await jsonBody(response)).toMatchObject({
    code: 429,
    msg: 'limited',
    retryAfter: 12,
  });
});

test('HTTP keeps shape failures in the body without failure metadata', async () => {
  const response = await request(async () => Response.json({ code: 200 }));
  expect(response.status).toBe(502);
  const body = await jsonBody(response);
  expect(body).toMatchObject({
    code: 502,
    upstreamShape: { module: 'album' },
  });
});
