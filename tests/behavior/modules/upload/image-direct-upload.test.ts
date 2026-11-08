import { expect, test } from 'bun:test';

import type { ModuleCallConfig } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { readWebBody } from '../../../_kit/upstream/wire.ts';
import { songFile, tokenBody } from '../../../fixtures/synthetic/upload.ts';

const ALLOC = 'https://music.163.com/weapi/nos/token/alloc';
const COVER = 'https://music.163.com/weapi/playlist/cover/update';
const coverResponse = {
  code: 200,
  future: { preserved: true },
  url: 'https://p1.music.126.net/direct-upload.jpg',
} as const;

// 固定熵后独立解码真实 weapi 正文，测试仍走生成 client 和唯一请求链。
const createClient = () => {
  const requests: Array<{ url: string; form: Record<string, unknown> }> = [];
  const config: ModuleCallConfig = {
    cookie: 'MUSIC_U=direct-upload',

    fetcher: async (input, init) => {
      const url = input instanceof Request ? input.url : input.toString();
      requests.push({
        url,
        form:
          typeof init?.body === 'string'
            ? url.includes('/weapi/')
              ? (readWebBody(init.body) as Record<string, unknown>)
              : {}
            : {},
      });
      if (url === ALLOC) return Response.json(tokenBody);
      if (
        [
          COVER,
          'https://nosup-hz1.127.net/yyimgs/voice/demo?offset=0&complete=true&version=1.0',
        ].includes(url)
      )
        return Response.json(coverResponse);
      throw new Error(`Unexpected direct upload target: ${url}`);
    },
  };
  const client = createClientFromContext(
    config,
    buildCallServices(config, false, { entropy: testEntropy }),
  );
  return { client, requests };
};

test('imageUploadToken returns everything a browser needs to upload the JPEG itself', async () => {
  const { client, requests } = createClient();

  const result = await client.imageUploadToken();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    code: 200,
    data: {
      imgId: 'doc-1',
      token: 'nos-token',
      uploadUrl:
        'https://nosup-hz1.127.net/yyimgs/voice/demo?offset=0&complete=true&version=1.0',
      url_pre: 'https://p1.music.126.net/voice/demo',
    },
  });
  expect(requests.map(({ url }) => url)).toEqual([ALLOC]);
  expect(requests[0]?.form).toMatchObject({ bucket: 'yyimgs', ext: 'jpg' });
});

test('playlistCoverUpdate sets an already uploaded image by imgId without uploading again', async () => {
  const { client, requests } = createClient();
  const ticket = await client.imageUploadToken();

  const result = await client.playlistCoverUpdate({
    id: 9,
    imgId: ticket.body.data.imgId,
  });

  expect(requests.map(({ url }) => url)).toEqual([ALLOC, COVER]);
  expect(requests[1]?.form).toMatchObject({ id: 9, coverImgId: 'doc-1' });
  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    code: 200,
    data: coverResponse,
  });
});

test('playlistCoverUpdate with imgFile still uploads the image before setting it', async () => {
  const { client, requests } = createClient();

  await client.playlistCoverUpdate({
    id: 9,
    imgFile: { ...songFile, name: 'cover.jpg', mimetype: 'image/jpeg' },
  });

  expect(requests.map(({ url }) => url)).toEqual([
    ALLOC,
    'https://nosup-hz1.127.net/yyimgs/voice/demo?offset=0&complete=true&version=1.0',
    COVER,
  ]);
  expect(requests[2]?.form).toMatchObject({ id: 9, coverImgId: 'doc-1' });
});

test.each([
  {
    case: 'both imgFile and imgId',
    query: { id: 9, imgId: 'doc-1', imgFile: songFile },
  },
  { case: 'neither imgFile nor imgId', query: { id: 9 } },
])(
  'playlistCoverUpdate with $case answers 400 before any request',
  async ({ query }) => {
    const { client, requests } = createClient();

    const result = await client.playlistCoverUpdate(query);

    expect(result.status).toBe(400);
    expect(requests).toEqual([]);
  },
);
