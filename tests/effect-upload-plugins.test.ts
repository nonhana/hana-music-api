import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import { normalizeFailure } from '../src/core/response.ts';
import avatarUpload from '../src/modules/avatar_upload.ts';
import cloud from '../src/modules/cloud.ts';
import playlistCoverUpdate from '../src/modules/playlist_cover_update.ts';
import type { RequestIntent } from '../src/types/index.ts';
import {
  executeModule,
  response,
  songFile,
  tokenBody,
} from './fixtures/upload-effect.ts';

test.each([
  {
    implementation: avatarUpload,
    identifier: 'avatar_upload',
    final: '/api/user/avatar/upload/v1',
  },
  {
    implementation: playlistCoverUpdate,
    identifier: 'playlist_cover_update',
    final: '/api/playlist/cover/update',
  },
])(
  '$identifier uses one injected capability for image token, NOS and final API',
  async (scenario) => {
    const intents: Array<RequestIntent> = [];
    const result = await Effect.runPromise(
      executeModule(
        scenario.implementation,
        { id: 9, imgFile: { ...songFile, name: 'image.jpg' } },
        (intent) =>
          Effect.sync(() => {
            intents.push(intent);
            return response(
              intent.target === '/api/nos/token/alloc'
                ? tokenBody
                : { code: 200, future: { preserved: true } },
            );
          }),
      ),
    );
    expect(intents.map((intent) => intent.target)).toEqual([
      '/api/nos/token/alloc',
      'https://nosup-hz1.127.net/yyimgs/voice/demo?offset=0&complete=true&version=1.0',
      scenario.final,
    ]);
    expect(intents[1]).toMatchObject({
      protocol: 'plain',
      method: 'POST',
      response: 'bytes',
      semantic: 'upload',
      body: new Uint8Array([1, 2]),
    });
    expect(JSON.parse(String(intents[2]?.body))).toEqual(
      scenario.identifier === 'avatar_upload'
        ? { imgid: 'doc-1' }
        : { id: 9, coverImgId: 'doc-1' },
    );
    expect(result.body).toMatchObject({
      code: 200,
      data: {
        imgId: 'doc-1',
        url_pre: 'https://p1.music.126.net/voice/demo',
        future: { preserved: true },
      },
    });
  },
);

test('cloud plugin token, LBS, audio and publication share the same capability', async () => {
  const intents: Array<RequestIntent> = [];
  const result = await Effect.runPromise(
    executeModule(cloud, { songFile }, (intent) =>
      Effect.sync(() => {
        intents.push(intent);
        return response(
          intent.target === '/api/cloud/upload/check'
            ? { code: 200, needUpload: true, songId: 7 }
            : intent.target === '/api/nos/token/alloc'
              ? tokenBody
              : intent.target.includes('/lbs?')
                ? { upload: ['https://nosup-hz1.127.net'] }
                : { code: 200, songId: 7, future: [null, true] },
        );
      }),
    ),
  );
  expect(intents.map((intent) => intent.target)).toEqual([
    '/api/cloud/upload/check',
    '/api/nos/token/alloc',
    '/api/nos/token/alloc',
    'https://wanproxy.127.net/lbs?version=1.0&bucketname=jd-musicrep-privatecloud-audio-public',
    'https://nosup-hz1.127.net/jd-musicrep-privatecloud-audio-public/voice%2Fdemo?offset=0&complete=true&version=1.0',
    '/api/upload/cloud/info/v2',
    '/api/cloud/pub/v2',
  ]);
  expect(intents[3]).toMatchObject({
    protocol: 'plain',
    method: 'GET',
    semantic: 'read',
    response: 'json',
  });
  expect(intents[4]).toMatchObject({
    protocol: 'plain',
    method: 'POST',
    semantic: 'upload',
    response: 'bytes',
  });
  expect(result.body).toMatchObject({ songId: 7, future: [null, true] });
  expect(songFile).not.toHaveProperty('md5');
});

test.each([avatarUpload, playlistCoverUpdate, cloud])(
  'upload token fields fail with typed partial state before the next request',
  async (implementation) => {
    let sent = 0;
    const error = await Effect.runPromise(
      Effect.flip(
        executeModule(implementation, { imgFile: songFile, songFile }, () =>
          Effect.sync(() => {
            sent += 1;
            return response({ code: 200, result: null });
          }),
        ),
      ),
    );
    expect(error).toMatchObject({
      _tag: 'PartialUpload',
      cause: { _tag: 'UnexpectedUpstreamShape' },
    });
    expect(normalizeFailure(error)).toMatchObject({
      status: 502,
      body: { partialCompletion: true, completedStages: sent },
    });
    expect(sent).toBe(1);
  },
);

test.each([{ upload: [] }, { upload: [null] }, { upload: [''] }])(
  'cloud rejects a missing first NOS upload target: %j',
  async ({ upload }) => {
    const intents: Array<RequestIntent> = [];
    const error = await Effect.runPromise(
      Effect.flip(
        executeModule(cloud, { songFile }, (intent) =>
          Effect.sync(() => {
            intents.push(intent);
            return response(
              intent.target === '/api/cloud/upload/check'
                ? { needUpload: true, songId: 7 }
                : intent.target.includes('/lbs?')
                  ? { upload }
                  : tokenBody,
            );
          }),
        ),
      ),
    );
    expect(error).toMatchObject({
      _tag: 'PartialUpload',
      cause: { _tag: 'UnexpectedUpstreamShape', path: 'upload[0]' },
    });
    expect(intents).toHaveLength(4);
  },
);

test('unused LBS entries do not constrain the first upload target', async () => {
  const intents: Array<RequestIntent> = [];
  const result = await Effect.runPromise(
    executeModule(cloud, { songFile }, (intent) =>
      Effect.sync(() => {
        intents.push(intent);
        return response(
          intent.target === '/api/cloud/upload/check'
            ? { needUpload: true, songId: 7 }
            : intent.target === '/api/nos/token/alloc'
              ? tokenBody
              : intent.target.includes('/lbs?')
                ? { upload: ['https://nosup-hz1.127.net', { future: true }] }
                : { songId: 7 },
        );
      }),
    ),
  );
  expect(result.status).toBe(200);
  expect(intents[4]?.target).toContain('https://nosup-hz1.127.net/');
});
