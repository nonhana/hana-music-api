import { describe, expect, test } from 'bun:test';

import { Effect } from 'effect';

import type { ModuleCallConfig } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import voiceUpload, {
  createMultipartCompleteXml,
  parseMultipartUploadId,
} from '../../../../src/modules/voice_upload.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import type { RequestCapability } from '../../../../src/types/index.ts';
import { settle } from '../../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import type { RecordedAction } from '../../../_kit/module.ts';
import {
  captureBoundModule,
  executeModule,
  response,
} from '../../../_kit/upload.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import type {
  UpstreamExpectation,
  WireRequest,
} from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import {
  initXml,
  songFile,
  tokenBody,
} from '../../../fixtures/synthetic/upload.ts';

const createHanaMusicApi = (config: ModuleCallConfig) =>
  createClientFromContext(
    config,
    buildCallServices(config, false, { entropy: testEntropy }),
  );

const stages = [
  '/api/nos/token/alloc',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploads',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?partNumber=1&uploadId=upload-123',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploadId=upload-123',
  '/api/voice/workbench/voice/batch/upload/preCheck',
  '/api/voice/workbench/voice/batch/upload/v2',
];

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
    const intents: Array<RecordedAction> = [];
    const request: RequestCapability = (action, args) => {
      const intent = { action, args };
      return Effect.sync(() => {
        intents.push(intent);
        let body: unknown = {
          code: 200,
          data: { voiceId: 'voice-1', future: [true, null] },
        };
        if (action === 'allocate') body = tokenBody;
        else if (action === 'initialize') body = initXml;
        return response(
          body,
          new Headers({
            etag: args.target?.includes('partNumber=2') ? 'etag-2' : 'etag-1',
          }),
        );
      });
    };
    const result = await runEffect(
      executeModule(
        voiceUpload,
        {
          songFile: { ...songFile, data: new Uint8Array(10 * 1024 * 1024 + 1) },
          songName: 'demo-track',
          composedSongs: [1, 2],
          autoPublish: true,
          privacy: false,
        },
        request,
      ),
    );
    expect(result).toEqual({
      status: 200,
      cookie: [],
      body: { code: 200, data: { voiceId: 'voice-1', future: [true, null] } },
    });
    expect(intents.map((intent) => intent.action)).toEqual([
      'allocate',
      'initialize',
      'part',
      'part',
      'complete',
      'preCheck',
      'submit',
    ]);
    expect(intents.slice(1, 5).map((intent) => intent.args.target)).toEqual([
      ...stages.slice(1, 3),
      'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?partNumber=2&uploadId=upload-123',
      stages[3],
    ]);
    expect((intents[2]!.args.body as Uint8Array).byteLength).toBe(
      10 * 1024 * 1024,
    );
    expect((intents[3]!.args.body as Uint8Array).byteLength).toBe(1);
    expect(intents[4]?.args.body).toBe(
      createMultipartCompleteXml(['etag-1', 'etag-2']),
    );
    for (const intent of intents.slice(5)) {
      expect(intent.args.headers?.['x-nos-token']).toBe('nos-token');
      const voiceData = JSON.parse(
        (intent.args.data as { voiceData: string }).voiceData,
      ) as Array<Record<string, unknown>>;
      expect(voiceData[0]).toMatchObject({
        autoPublish: true,
        composedSongs: ['1', '2'],
        orderNo: 1,
        privacy: false,
        publishTime: 0,
      });
    }
  });

  test.each([0, 1, 2, 3, 4, 5])(
    'failure at stage %d reports only completed stages and sends nothing further',
    async (failureIndex) => {
      const expected = publicVoiceStages('voice-failure')
        .slice(0, failureIndex + 1)
        .map((entry, index) =>
          index === failureIndex
            ? {
                ...entry,
                response: () =>
                  Response.json(
                    { code: 403, detail: 'retained' },
                    { status: 403 },
                  ),
              }
            : entry,
        );
      await withScenario(expected, async (network) => {
        const result = await captureBoundModule(
          voiceUpload,
          { songFile },
          network.fetcher,
          { cookie: 'MUSIC_U=voice-failure' },
        );
        expect(result.failure).toMatchObject(
          failureIndex === 0
            ? { _tag: 'ProtocolFailed' }
            : {
                _tag: 'PartialUpload',
                module: 'voice_upload',
                completedStages: stages.slice(0, failureIndex),
              },
        );
        expect(result.outcome).toMatchObject({
          rejected: {
            status: 403,
            body: {
              ...(failureIndex === 0 || failureIndex > 3
                ? { code: 403, detail: 'retained' }
                : {}),
              ...(failureIndex
                ? { partialCompletion: true, completedStages: failureIndex }
                : {}),
            },
          },
        });
        if (failureIndex > 0) {
          let expectedBody: unknown = { code: 403, detail: 'retained' };
          if (failureIndex === 1) {
            expectedBody = JSON.stringify(expectedBody);
          } else if (failureIndex < 4) {
            expectedBody = Array.from(
              new TextEncoder().encode(JSON.stringify(expectedBody)),
            );
          }
          expect(result.failure).toMatchObject({
            cause: {
              response: {
                body: expectedBody,
              },
            },
          });
        }
        expect(result.completedStages).toEqual(stages.slice(0, failureIndex));
        expect(network.sent).toHaveLength(failureIndex + 1);
      });
    },
  );

  test('bound upload enforces its total deadline during the next body and releases the reader', async () => {
    let cancelled = false;
    const expected = publicVoiceStages('voice-deadline').slice(0, 2);
    expected[1] = {
      ...expected[1]!,
      response: () =>
        new Response(
          new ReadableStream({
            cancel: () => {
              cancelled = true;
            },
          }),
        ),
    };
    await withScenario(expected, async (network) => {
      const result = await captureBoundModule(
        voiceUpload,
        { songFile },
        network.fetcher,
        { cookie: 'MUSIC_U=voice-deadline', timeoutMs: 200 },
      );
      expect(result.outcome).toMatchObject({
        rejected: {
          status: 504,
          body: { partialCompletion: true, completedStages: 1 },
        },
      });
      expect(result.completedStages).toEqual(stages.slice(0, 1));
      expect(network.sent).toHaveLength(2);
      expect(cancelled).toBe(true);
    });
  });

  test('interruption stops subsequent stages and carries partial progress', async () => {
    const stage = createStage('voice initialization');
    const controller = new AbortController();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const expected = publicVoiceStages('voice-cancel').slice(0, 2);
    expected[1] = {
      ...expected[1]!,
      response: async () => {
        stage.reach();
        await gate;
        throw new DOMException('Aborted', 'AbortError');
      },
    };
    await withScenario(expected, async (network) => {
      const pending = captureBoundModule(
        voiceUpload,
        { songFile },
        network.fetcher,
        { cookie: 'MUSIC_U=voice-cancel', signal: controller.signal },
      );
      try {
        await stage.wait(pending);
        controller.abort();
        const result = await pending;
        expect(result.outcome).toMatchObject({
          rejected: {
            status: 499,
            body: { partialCompletion: true, completedStages: 1 },
          },
        });
        expect(result.completedStages).toEqual(stages.slice(0, 1));
        expect(network.sent).toHaveLength(2);
      } finally {
        controller.abort();
        release();
        await pending;
      }
    });
  });

  test('concurrent calls keep their completed-stage counts isolated', async () => {
    const results = await Promise.all(
      [1, 4].map(async (failureIndex) => {
        const account = `voice-concurrent-${failureIndex}`;
        const expected = publicVoiceStages(account)
          .slice(0, failureIndex + 1)
          .map((entry, index) =>
            index === failureIndex
              ? {
                  ...entry,
                  response: () => Response.json({ code: 403 }, { status: 403 }),
                }
              : entry,
          );
        return withScenario(expected, async (network) => {
          const result = await captureBoundModule(
            voiceUpload,
            { songFile },
            network.fetcher,
            { cookie: `MUSIC_U=${account}` },
          );
          expect(result.completedStages).toEqual(stages.slice(0, failureIndex));
          expect(network.sent).toHaveLength(failureIndex + 1);
          return result.outcome;
        });
      }),
    );
    expect(results).toMatchObject([
      { rejected: { body: { completedStages: 1 } } },
      { rejected: { body: { completedStages: 4 } } },
    ]);
  });
});

const publicVoiceStages = (
  account: string,
  token = 'nos-token',
): Array<UpstreamExpectation> => [
  {
    url: 'https://music.163.com/weapi/nos/token/alloc',
    method: 'POST',
    check: (wire: WireRequest) => {
      expect(wire.headers.get('cookie')).toContain(`MUSIC_U=${account}`);
      expect(readWebBody(wire.body)).toMatchObject({
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
    url: `https://interface.music.163.com/eapi/voice/workbench/voice/batch/upload/${action}`,
    method: 'POST',
    headers: { 'x-nos-token': token },
    check: (wire: WireRequest) => {
      expect(wire.headers.get('cookie')).toContain(`MUSIC_U=${account}`);
      const form = readEapiBody(wire.body).data as Record<string, string>;
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

            fetcher: scenario.fetcher,
          });
          expect((await client.voiceUpload({ songFile })).status).toBe(200);
          expect(scenario.entries).toHaveLength(6);
        },
      ),
    ),
  );
});
