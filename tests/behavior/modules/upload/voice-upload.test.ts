import { describe, expect, test } from 'bun:test';

import { Effect, Result } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../../../../index.ts';
import {
  DeadlineExceeded,
  ProtocolFailed,
} from '../../../../src/core/errors.ts';
import { normalizeFailure } from '../../../../src/core/response.ts';
import voiceUpload, {
  createMultipartCompleteXml,
  parseMultipartUploadId,
} from '../../../../src/modules/voice_upload.ts';
import type {
  RequestCapability,
  RequestIntent,
} from '../../../../src/types/index.ts';
import { expectFailure, settle } from '../../../_kit/assertions.ts';
import { runEffect, runExit } from '../../../_kit/it.ts';
import { executeModule, response } from '../../../_kit/upload.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import type {
  UpstreamExpectation,
  WireRequest,
} from '../../../_kit/upstream/scenario.ts';
import {
  initXml,
  songFile,
  tokenBody,
} from '../../../fixtures/synthetic/upload.ts';

const stages = [
  '/api/nos/token/alloc',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploads',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?partNumber=1&uploadId=upload-123',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploadId=upload-123',
  '/api/voice/workbench/voice/batch/upload/preCheck',
  '/api/voice/workbench/voice/batch/upload/v2',
];

const stageResponse = (intent: RequestIntent) =>
  response(
    intent.target === stages[0]
      ? tokenBody
      : intent.target.endsWith('?uploads')
        ? initXml
        : { code: 200, data: { voiceId: 'voice-1', future: [true, null] } },
    new Headers({
      etag: intent.target.includes('partNumber=2') ? 'etag-2' : 'etag-1',
    }),
  );

describe('voice multipart XML', () => {
  test('parses UploadId as an Effect value', async () => {
    const parsed = parseMultipartUploadId(initXml);
    expect(Effect.isEffect(parsed)).toBe(true);
    if (Effect.isEffect(parsed)) {
      expect(await runEffect(parsed)).toBe('upload-123');
    }
  });
  test('malformed XML has a typed field failure', async () => {
    let result: unknown;
    try {
      const parsed = parseMultipartUploadId(
        '<InitiateMultipartUploadResult />',
      );
      result = Effect.isEffect(parsed)
        ? await runEffect(Effect.flip(parsed))
        : parsed;
    } catch (error) {
      result = error;
    }
    expect(result).toMatchObject({
      _tag: 'UnexpectedUpstreamShape',
      module: 'voice_upload',
      path: 'UploadId',
    });
    expect(result).not.toBeInstanceOf(TypeError);
  });
  test('serializes parts in upload order', () => {
    expect(createMultipartCompleteXml(['etag-1', 'etag-2'])).toBe(
      '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>etag-1</ETag></Part><Part><PartNumber>2</PartNumber><ETag>etag-2</ETag></Part></CompleteMultipartUpload>',
    );
  });
});

describe('voice upload Effect', () => {
  test('one capability receives token, ordered parts, completion and voice metadata', async () => {
    const intents: Array<RequestIntent> = [];
    const request: RequestCapability = (intent) =>
      Effect.sync(() => {
        intents.push(intent);
        return stageResponse(intent);
      });
    const result = await runEffect(
      executeModule(
        voiceUpload,
        {
          songFile: { ...songFile, data: new Uint8Array(10 * 1024 * 1024 + 1) },
          songName: 'demo-track',
          composedSongs: '1,2',
          autoPublish: 1,
          privacy: 0,
        },
        request,
      ),
    );
    expect(result).toEqual({
      status: 200,
      cookie: [],
      body: { code: 200, data: { voiceId: 'voice-1', future: [true, null] } },
    });
    expect(intents.map((intent) => intent.target)).toEqual([
      ...stages.slice(0, 3),
      'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?partNumber=2&uploadId=upload-123',
      ...stages.slice(3),
    ]);
    expect(
      intents.map((intent) => [
        intent.protocol,
        intent.method,
        intent.semantic,
        intent.response,
      ]),
    ).toEqual([
      ['weapi', 'POST', 'upload', 'json'],
      ['plain', 'POST', 'upload', 'text'],
      ['plain', 'PUT', 'upload', 'bytes'],
      ['plain', 'PUT', 'upload', 'bytes'],
      ['plain', 'POST', 'upload', 'bytes'],
      ['eapi', 'POST', 'upload', 'json'],
      ['eapi', 'POST', 'upload', 'json'],
    ]);
    expect((intents[2]!.body as Uint8Array).byteLength).toBe(10 * 1024 * 1024);
    expect((intents[3]!.body as Uint8Array).byteLength).toBe(1);
    expect(intents[4]?.body).toBe(
      createMultipartCompleteXml(['etag-1', 'etag-2']),
    );
    for (const intent of intents.slice(5)) {
      expect(intent.headers['x-nos-token']).toBe('nos-token');
      expect(JSON.parse(String(intent.body))).toMatchObject({
        voiceData: expect.stringContaining('"composedSongs":["1","2"]'),
      });
    }
  });

  test.each([0, 1, 2, 3, 4, 5])(
    'failure at stage %d reports only completed stages and sends nothing further',
    async (failureIndex) => {
      const sent: Array<string> = [];
      const failure = ProtocolFailed.make({
        message: 'stage rejected',
        response: {
          ...response({ code: 403, detail: 'retained' }),
          status: 403,
        },
      });
      const request: RequestCapability = (intent) =>
        Effect.suspend(() => {
          sent.push(intent.target);
          return sent.length === failureIndex + 1
            ? Effect.fail(failure)
            : Effect.succeed(stageResponse(intent));
        });
      const result = await runEffect(
        Effect.result(executeModule(voiceUpload, { songFile }, request)),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (!Result.isFailure(result)) {
        return;
      }
      expect(result.failure).toMatchObject(
        failureIndex === 0
          ? { _tag: 'ProtocolFailed' }
          : {
              _tag: 'PartialUpload',
              module: 'voice_upload',
              completedStages: stages.slice(0, failureIndex),
            },
      );
      expect(result.failure.pipe(normalizeFailure)).toMatchObject({
        status: 403,
        body: {
          code: 403,
          detail: 'retained',
          ...(failureIndex
            ? { partialCompletion: true, completedStages: failureIndex }
            : {}),
        },
      });
      expect(sent).toEqual(stages.slice(0, failureIndex + 1));
    },
  );

  test('checks the current Call deadline before the next stage even with an injected capability', async () => {
    const sent: Array<string> = [];
    const request: RequestCapability = (intent) =>
      Effect.gen(function* () {
        sent.push(intent.target);
        yield* TestClock.adjust(50);
        return stageResponse(intent);
      });
    const result = await runEffect(
      Effect.gen(function* () {
        yield* TestClock.setTime(0);
        return yield* Effect.result(
          executeModule(voiceUpload, { songFile }, request, {}, 50),
        );
      }),
      TestClock.layer(),
    );
    expect(Result.isFailure(result)).toBe(true);
    if (Result.isFailure(result)) {
      expect(result.failure.pipe(normalizeFailure)).toMatchObject({
        status: 504,
        body: { partialCompletion: true, completedStages: 1 },
      });
    }
    expect(sent).toEqual(stages.slice(0, 1));
  });

  test('an expired Call never sends its token request', async () => {
    let sent = 0;
    const request: RequestCapability = () =>
      Effect.sync(() => {
        sent += 1;
        return response(tokenBody);
      });
    const result = await runEffect(
      Effect.flip(executeModule(voiceUpload, { songFile }, request, {}, 0)),
    );
    expect(result).toBeInstanceOf(DeadlineExceeded);
    expect(sent).toBe(0);
  });

  test('interruption stops subsequent stages and carries partial progress', async () => {
    const sent: Array<string> = [];
    const request: RequestCapability = (intent) =>
      Effect.suspend(() => {
        sent.push(intent.target);
        return sent.length === 2
          ? Effect.interrupt
          : Effect.succeed(stageResponse(intent));
      });
    const exit = await runExit(
      executeModule(voiceUpload, { songFile }, request),
    );
    expect(exit.pipe(expectFailure)).toMatchObject({
      status: 499,
      body: { partialCompletion: true, completedStages: 1 },
    });
    expect(sent).toEqual(stages.slice(0, 2));
  });

  test('concurrent calls keep their completed-stage counts isolated', async () => {
    const counts = await Promise.all(
      [1, 4].map(async (failureIndex) => {
        let sent = 0;
        const request: RequestCapability = (intent) =>
          Effect.suspend(() => {
            sent += 1;
            return sent > failureIndex
              ? Effect.fail(
                  DeadlineExceeded.make({ message: 'Request timed out' }),
                )
              : Effect.succeed(stageResponse(intent));
          });
        return normalizeFailure(
          await runEffect(
            Effect.flip(executeModule(voiceUpload, { songFile }, request)),
          ),
        );
      }),
    );
    expect(counts).toMatchObject([
      { body: { completedStages: 1 } },
      { body: { completedStages: 4 } },
    ]);
  });
});

const publicVoiceStages = (
  account: string,
  token = 'nos-token',
): Array<UpstreamExpectation> => [
  {
    url: 'https://interface.music.163.com/api/nos/token/alloc',
    method: 'POST',
    check: (wire: WireRequest) => {
      expect(wire.headers.get('cookie')).toContain(`MUSIC_U=${account}`);
      expect(Object.fromEntries(new URLSearchParams(wire.body))).toMatchObject({
        bucket: 'ymusic',
        ext: 'mp3',
        filename: 'demo',
      });
    },
    response: () =>
      Response.json({ ...tokenBody, result: { ...tokenBody.result, token } }),
  },
  {
    url: 'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploads',
    method: 'POST',
    headers: { 'x-nos-token': token },
    response: () => new Response(initXml),
  },
  {
    url: 'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?partNumber=1&uploadId=upload-123',
    method: 'PUT',
    headers: { 'x-nos-token': token, 'content-type': 'audio/mpeg' },
    check: (wire: WireRequest) =>
      expect(new TextEncoder().encode(wire.body)).toEqual(
        new Uint8Array([1, 2]),
      ),
    response: () => new Response('', { headers: { etag: 'etag-1' } }),
  },
  {
    url: 'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploadId=upload-123',
    method: 'POST',
    headers: { 'x-nos-token': token },
    body: '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>etag-1</ETag></Part></CompleteMultipartUpload>',
    response: () => new Response(''),
  },
  ...['preCheck', 'v2'].map((action) => ({
    url: `https://interface.music.163.com/api/voice/workbench/voice/batch/upload/${action}`,
    method: 'POST',
    headers: { 'x-nos-token': token },
    check: (wire: WireRequest) => {
      expect(wire.headers.get('cookie')).toContain(`MUSIC_U=${account}`);
      const form = Object.fromEntries(new URLSearchParams(wire.body));
      expect(JSON.parse(form.voiceData!)).toMatchObject([
        { name: 'demo', dfsId: 'doc-1', composedSongs: [] },
      ]);
      expect(form.dupkey).toBeString();
    },
    response: () =>
      Response.json({
        code: 200,
        data: { voiceId: 'voice-1', future: [true, null] },
      }),
  })),
];

test('public voiceUpload executes token, part, completion and submission through the strict transport', async () => {
  await withScenario(publicVoiceStages('public-voice'), async (scenario) => {
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=public-voice',
      crypto: 'api',
      fetcher: scenario.fetcher,
    });
    expect((await client.voiceUpload({ songFile })).body).toEqual({
      code: 200,
      data: { voiceId: 'voice-1', future: [true, null] },
    });
    expect(scenario.entries).toHaveLength(6);
  });
});

test.each([0, 1, 2, 3, 4, 5])(
  'public voiceUpload stops after a failed strict stage %d',
  async (failedStage) => {
    const expectedStages = publicVoiceStages('failed-voice')
      .slice(0, failedStage + 1)
      .map((stage, index) =>
        index === failedStage
          ? {
              ...stage,
              response: () =>
                Response.json(
                  { code: 403, detail: 'stage rejected' },
                  { status: 403 },
                ),
            }
          : stage,
      );
    await withScenario(expectedStages, async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=failed-voice',
        crypto: 'api',
        fetcher: scenario.fetcher,
      });
      expect(await settle(client.voiceUpload({ songFile }))).toEqual({
        rejected: {
          status: 403,
          cookie: [],
          body: {
            ...(failedStage === 0 || failedStage >= 4
              ? { code: 403, detail: 'stage rejected' }
              : {}),
            ...(failedStage
              ? { partialCompletion: true, completedStages: failedStage }
              : {}),
          },
        },
      });
      expect(scenario.entries).toHaveLength(failedStage + 1);
    });
  },
);

test('public voiceUpload cancellation sends no later upload or commit stage', async () => {
  const controller = new AbortController();
  const expectedStages = publicVoiceStages('cancel-voice')
    .slice(0, 3)
    .map((stage, index) =>
      index === 2
        ? {
            ...stage,
            response: (wire: WireRequest) => {
              controller.abort();
              wire.signal.throwIfAborted();
              return new Response('');
            },
          }
        : stage,
    );
  await withScenario(expectedStages, async (scenario) => {
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=cancel-voice',
      crypto: 'api',
      fetcher: scenario.fetcher,
    });
    expect(
      await settle(
        client.voiceUpload({ songFile }, { signal: controller.signal }),
      ),
    ).toMatchObject({
      rejected: {
        status: 499,
        body: { partialCompletion: true, completedStages: 2 },
      },
    });
    expect(scenario.entries).toHaveLength(3);
  });
});

test('concurrent public voice uploads isolate accounts, tokens and completed stages', async () => {
  await Promise.all(
    ['first-upload', 'second-upload'].map((account) =>
      withScenario(
        publicVoiceStages(account, `${account}-token`),
        async (scenario) => {
          const client = createHanaMusicApi({
            cookie: `MUSIC_U=${account}`,
            crypto: 'api',
            fetcher: scenario.fetcher,
          });
          expect((await client.voiceUpload({ songFile })).status).toBe(200);
          expect(scenario.entries).toHaveLength(6);
        },
      ),
    ),
  );
});
