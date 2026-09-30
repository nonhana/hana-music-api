import { describe, expect, test } from 'bun:test';

import { Effect, Exit, Result } from 'effect';
import { TestClock } from 'effect/testing';

import { DeadlineExceeded, ProtocolFailed } from '../src/core/errors.ts';
import { normalizeFailure } from '../src/core/response.ts';
import voiceUpload from '../src/modules/voice_upload.ts';
import {
  createMultipartCompleteXml,
  parseMultipartUploadId,
} from '../src/modules/voice_upload/multipart_xml.ts';
import type { RequestCapability, RequestIntent } from '../src/types/index.ts';
import {
  executeModule,
  initXml,
  response,
  songFile,
  tokenBody,
} from './fixtures/upload-effect.ts';

const stages = [
  '/api/nos/token/alloc',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploads',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?partNumber=1&uploadId=upload-123',
  'https://ymusic.nos-hz.163yun.com/voice%2Fdemo?uploadId=upload-123',
  '/api/voice/workbench/voice/batch/upload/preCheck',
  '/api/voice/workbench/voice/batch/upload/v2',
];

const stageResponse = (intent: RequestIntent) => {
  return response(
    intent.target === stages[0]
      ? tokenBody
      : intent.target.endsWith('?uploads')
        ? initXml
        : { code: 200, data: { voiceId: 'voice-1', future: [true, null] } },
    new Headers({
      etag: intent.target.includes('partNumber=2') ? 'etag-2' : 'etag-1',
    }),
  );
};

describe('voice multipart XML', () => {
  test('parses UploadId as an Effect value', async () => {
    const parsed = parseMultipartUploadId(initXml);
    expect(Effect.isEffect(parsed)).toBe(true);
    if (Effect.isEffect(parsed)) {
      expect(await Effect.runPromise(parsed)).toBe('upload-123');
    }
  });
  test('malformed XML has a typed field failure', async () => {
    let result: unknown;
    try {
      const parsed = parseMultipartUploadId(
        '<InitiateMultipartUploadResult />',
      );
      result = Effect.isEffect(parsed)
        ? await Effect.runPromise(Effect.flip(parsed))
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
    const result = await Effect.runPromise(
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
      const failure = new ProtocolFailed({
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
      const result = await Effect.runPromise(
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
      expect(normalizeFailure(result.failure)).toMatchObject({
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
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        yield* TestClock.setTime(0);
        return yield* Effect.result(
          executeModule(voiceUpload, { songFile }, request, {}, 50),
        );
      }).pipe(Effect.provide(TestClock.layer())),
    );
    expect(Result.isFailure(result)).toBe(true);
    if (Result.isFailure(result)) {
      expect(normalizeFailure(result.failure)).toMatchObject({
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
    const result = await Effect.runPromise(
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
    const exit = await Effect.runPromiseExit(
      executeModule(voiceUpload, { songFile }, request),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      expect(normalizeFailure(exit.cause)).toMatchObject({
        status: 499,
        body: { partialCompletion: true, completedStages: 1 },
      });
    }
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
                  new DeadlineExceeded({ message: 'Request timed out' }),
                )
              : Effect.succeed(stageResponse(intent));
          });
        return normalizeFailure(
          await Effect.runPromise(
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
