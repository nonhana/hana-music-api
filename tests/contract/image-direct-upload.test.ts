import { expect, test } from 'bun:test';

import { createHanaMusicApi } from '../../index.ts';
import { songFile, tokenBody } from '../fixtures/upload-effect.ts';

const ALLOC = 'https://interface.music.163.com/api/nos/token/alloc';
const COVER = 'https://interface.music.163.com/api/playlist/cover/update';

// 用 api 协议让请求体保持明文表单，测试直接读取发给网易云的字段。
const createClient = () => {
  const requests: Array<{ url: string; form: Record<string, string> }> = [];
  const client = createHanaMusicApi({
    cookie: 'MUSIC_U=direct-upload',
    crypto: 'api',
    e_r: false,
    fetcher: async (input, init) => {
      const url = input instanceof Request ? input.url : input.toString();
      requests.push({
        url,
        form:
          typeof init?.body === 'string'
            ? Object.fromEntries(new URLSearchParams(init.body))
            : {},
      });
      return url === ALLOC
        ? Response.json(tokenBody)
        : Response.json({ code: 200, future: { preserved: true } });
    },
  });
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
  expect(requests[1]?.form).toMatchObject({ id: '9', coverImgId: 'doc-1' });
  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    code: 200,
    data: { code: 200, future: { preserved: true } },
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
  expect(requests[2]?.form).toMatchObject({ id: '9', coverImgId: 'doc-1' });
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
