// cspell:words bucketname
import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import avatarUpload from '../../../../src/modules/avatar_upload.ts';
import cloud from '../../../../src/modules/cloud.ts';
import playlistCoverUpdate from '../../../../src/modules/playlist_cover_update.ts';
import { sdkModuleRegistry } from '../../../../src/sdk/generated/registry.generated.ts';
import { runEffect } from '../../../_kit/it.ts';
import type { RecordedAction } from '../../../_kit/module.ts';
import {
  captureBoundModule,
  executeModule,
  response,
} from '../../../_kit/upload.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { songFile, tokenBody } from '../../../fixtures/synthetic/upload.ts';

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
    const intents: Array<RecordedAction> = [];
    const result = await runEffect(
      executeModule(
        scenario.implementation,
        { id: 9, imgFile: { ...songFile, name: 'image.jpg' } },
        (action, args) => {
          const intent = { action, args };
          return Effect.sync(() => {
            intents.push(intent);
            return response(
              ['imageAllocate', 'allocate', 'songAllocate'].includes(
                intent.action,
              )
                ? tokenBody
                : scenario.identifier === 'playlist_cover_update'
                  ? {
                      code: 200,
                      future: { preserved: true },
                      url: 'https://p1.music.126.net/cover.jpg',
                    }
                  : { code: 200, future: { preserved: true } },
            );
          });
        },
      ),
    );
    expect(intents.map((intent) => intent.action)).toEqual([
      'imageAllocate',
      'imageUpload',
      'submit',
    ]);
    expect(sdkModuleRegistry[scenario.identifier].actions.submit?.target).toBe(
      scenario.final,
    );
    expect(intents[1]?.args).toMatchObject({
      target:
        'https://nosup-hz1.127.net/yyimgs/voice/demo?offset=0&complete=true&version=1.0',
      body: new Uint8Array([1, 2]),
    });
    expect(intents[2]?.args.data).toEqual(
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
  const intents: Array<RecordedAction> = [];
  const result = await runEffect(
    executeModule(cloud, { songFile }, (action, args) => {
      const intent = { action, args };
      return Effect.sync(() => {
        intents.push(intent);
        return response(
          intent.action === 'check'
            ? { code: 200, needUpload: true, songId: 7 }
            : ['imageAllocate', 'allocate', 'songAllocate'].includes(
                  intent.action,
                )
              ? tokenBody
              : intent.action === 'songLookup'
                ? { upload: ['https://nosup-hz1.127.net'] }
                : { code: 200, songId: 7, future: [null, true] },
        );
      });
    }),
  );
  expect(intents.map((intent) => intent.action)).toEqual([
    'check',
    'allocate',
    'songAllocate',
    'songLookup',
    'songUpload',
    'information',
    'publish',
  ]);
  expect(intents[3]?.args.query).toBe(
    'version=1.0&bucketname=jd-musicrep-privatecloud-audio-public',
  );
  expect(intents[4]?.args).toMatchObject({
    target:
      'https://nosup-hz1.127.net/jd-musicrep-privatecloud-audio-public/voice%2Fdemo?offset=0&complete=true&version=1.0',
    body: new Uint8Array([1, 2]),
  });
  expect(result.body).toMatchObject({ songId: 7, future: [null, true] });
  expect(songFile).not.toHaveProperty('md5');
});

test.each([avatarUpload, playlistCoverUpdate, cloud])(
  'upload token fields fail with typed partial state before the next request',
  async (implementation) => {
    const target =
      implementation === cloud
        ? '/api/cloud/upload/check'
        : '/api/nos/token/alloc';
    const url =
      implementation === cloud
        ? 'https://interface.music.163.com/eapi/cloud/upload/check'
        : 'https://music.163.com/weapi/nos/token/alloc';
    await withScenario(
      [
        {
          url,
          method: 'POST',
          response: () => Response.json({ code: 200, result: null }),
        },
      ],
      async (network) => {
        const input =
          implementation === cloud
            ? { songFile }
            : implementation === playlistCoverUpdate
              ? { id: 1, imgFile: songFile }
              : { imgFile: songFile };
        const result = await captureBoundModule(
          implementation,
          input,
          network.fetcher,
          { cookie: 'MUSIC_U=upload-shape' },
        );
        expect(result.failure).toMatchObject({
          _tag: 'PartialUpload',
          completedStages: [target],
          cause: { _tag: 'UnexpectedUpstreamShape' },
        });
        expect(result.outcome).toMatchObject({
          rejected: {
            status: 502,
            body: { partialCompletion: true, completedStages: 1 },
          },
        });
        expect(result.completedStages).toEqual([target]);
        expect(network.sent).toHaveLength(1);
      },
    );
  },
);

test.each([{ upload: [] }, { upload: [null] }, { upload: [''] }])(
  'cloud rejects a missing first NOS upload target: %j',
  async ({ upload }) => {
    const targets = [
      '/api/cloud/upload/check',
      '/api/nos/token/alloc',
      '/api/nos/token/alloc',
      'https://wanproxy.127.net/lbs?version=1.0&bucketname=jd-musicrep-privatecloud-audio-public',
    ];
    await withScenario(
      [
        {
          url: 'https://interface.music.163.com/eapi/cloud/upload/check',
          method: 'POST',
          response: () =>
            Response.json({ code: 200, needUpload: true, songId: 7 }),
        },
        {
          url: 'https://interface.music.163.com/eapi/nos/token/alloc',
          method: 'POST',
          response: () => Response.json(tokenBody),
        },
        {
          url: 'https://music.163.com/weapi/nos/token/alloc',
          method: 'POST',
          response: () => Response.json(tokenBody),
        },
        {
          url: targets[3]!,
          method: 'GET',
          response: () => Response.json({ upload }),
        },
      ],
      async (network) => {
        const result = await captureBoundModule(
          cloud,
          { songFile },
          network.fetcher,
          { cookie: 'MUSIC_U=cloud-shape' },
        );
        expect(result.failure).toMatchObject({
          _tag: 'PartialUpload',
          completedStages: targets,
          cause: { _tag: 'UnexpectedUpstreamShape', path: 'upload[0]' },
        });
        expect(result.completedStages).toEqual(targets);
        expect(network.sent).toHaveLength(4);
      },
    );
  },
);

test('unused LBS entries do not constrain the first upload target', async () => {
  const intents: Array<RecordedAction> = [];
  const result = await runEffect(
    executeModule(cloud, { songFile }, (action, args) => {
      const intent = { action, args };
      return Effect.sync(() => {
        intents.push(intent);
        return response(
          intent.action === 'check'
            ? { needUpload: true, songId: 7 }
            : ['imageAllocate', 'allocate', 'songAllocate'].includes(
                  intent.action,
                )
              ? tokenBody
              : intent.action === 'songLookup'
                ? { upload: ['https://nosup-hz1.127.net', { future: true }] }
                : { songId: 7 },
        );
      });
    }),
  );
  expect(result.status).toBe(200);
  expect(intents[4]?.args.target).toContain('https://nosup-hz1.127.net/');
});
