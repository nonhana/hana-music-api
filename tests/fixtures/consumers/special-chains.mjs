import assert from 'node:assert/strict';
import { createDecipheriv } from 'node:crypto';

import * as sdk from 'hana-music-api';

// 固定此独立进程的 weapi 熵，消费者自行解密安装后的请求。
Math.random = () => 0;
const failures = [];
let requests = 0;
let providers = 0;
const bytes = Buffer.from([0, 255, 17, 128]);
const client = sdk.createHanaMusicApi({
  cookie: 'MUSIC_U=package-special; __csrf=csrf',
  state: { deviceId: 'package-special-device' },
});
for (const scenario of [
  {
    method: 'cloudImport',
    query: { id: 7, song: 'sample', fileType: 'flac' },
    steps: [
      {
        url: 'https://interface.music.163.com/eapi/cloud/upload/check/v2',
        data: { uploadType: 0, songs: '[{"songId":7}]' },
        response: { code: 200, data: [{ songId: 17 }] },
      },
      {
        url: 'https://interface.music.163.com/eapi/cloud/user/song/import',
        data: {
          uploadType: 0,
          songs:
            '[{"songId":17,"song":"sample","artist":"未知","album":"未知","fileName":"sample.flac"}]',
        },
        response: { code: 200 },
      },
    ],
  },
  {
    method: 'playlistTracks',
    query: { pid: 7, tracks: '17,18', op: 'add' },
    steps: [
      {
        url: 'https://interface.music.163.com/eapi/playlist/manipulate/tracks',
        data: { op: 'add', pid: 7, trackIds: '["17","18"]', imme: 'true' },
        response: { code: 512 },
      },
      {
        url: 'https://interface.music.163.com/eapi/playlist/manipulate/tracks',
        data: {
          op: 'add',
          pid: 7,
          trackIds: '["17","18","17","18"]',
          imme: 'true',
        },
        response: { code: 200 },
      },
    ],
  },
  {
    method: 'avatarUpload',
    query: {
      imgFile: {
        name: 'sample.jpg',
        data: bytes,
        mimetype: 'image/jpeg',
        size: bytes.length,
      },
    },
    steps: [
      {
        url: 'https://music.163.com/weapi/nos/token/alloc',
        data: {
          bucket: 'yyimgs',
          ext: 'jpg',
          filename: 'sample.jpg',
          local: false,
          nos_product: 0,
          return_body: '{"code":200,"size":"$(ObjectSize)"}',
          type: 'other',
        },
        response: {
          code: 200,
          result: { objectKey: 'sample.jpg', token: 'nos-only', docId: '17' },
        },
      },
      {
        url: 'https://nosup-hz1.127.net/yyimgs/sample.jpg?offset=0&complete=true&version=1.0',
        plain: true,
        response: { code: 200 },
      },
      {
        url: 'https://interface.music.163.com/eapi/user/avatar/upload/v1',
        data: { imgid: '17' },
        response: { code: 200 },
      },
    ],
  },
]) {
  for (const mode of ['none', 'string', 'provider', 'refusal']) {
    let sent = 0;
    let taken = 0;
    const token = mode === 'none' ? undefined : 'package-special-token';
    const result = await client[scenario.method](scenario.query, {
      checkToken:
        mode === 'provider'
          ? async () => {
              providers++;
              return `${token}-${++taken}`;
            }
          : token,
      fetcher: async (input, init) => {
        try {
          const expected = scenario.steps[sent++];
          requests++;
          assert.ok(expected, 'unexpected extra request');
          const request = new Request(input, init);
          assert.equal(request.url, expected.url);
          assert.equal(request.method, 'POST');
          if (expected.plain) {
            assert.equal(request.headers.get('cookie'), null);
            assert.equal(request.headers.get('X-antiCheatToken'), null);
            assert.equal(request.headers.get('x-nos-token'), 'nos-only');
            assert.deepEqual(Buffer.from(await request.arrayBuffer()), bytes);
          } else {
            const current = mode === 'provider' ? `${token}-${taken}` : token;
            assert.equal(
              request.headers.get('X-antiCheatToken'),
              current ?? null,
            );
            const cookie = request.headers.get('cookie');
            assert.ok(cookie.includes('MUSIC_U=package-special'));
            assert.ok(cookie.includes('deviceId=package-special-device'));
            assert.ok(!cookie.includes('package-special-token'));
            const params = new URLSearchParams(await request.text()).get(
              'params',
            );
            let decoded;
            if (expected.url.includes('/eapi/')) {
              const decipher = createDecipheriv(
                'aes-128-ecb',
                Buffer.from('e82ckenh8dichen8'),
                null,
              );
              const frame = Buffer.concat([
                decipher.update(Buffer.from(params, 'hex')),
                decipher.final(),
              ])
                .toString()
                .split('-36cd479b6b5-');
              assert.equal(
                frame[0],
                new URL(expected.url).pathname.replace('/eapi/', '/api/'),
              );
              decoded = JSON.parse(frame[1]);
              assert.equal(decoded.header['X-antiCheatToken'], current);
              assert.equal(decoded.header.os, 'iPhone OS');
              assert.ok(cookie.includes('os=iPhone%20OS'));
            } else {
              let value = params;
              for (const key of ['aaaaaaaaaaaaaaaa', '0CoJUm6Qyw8W8jud']) {
                const decipher = createDecipheriv(
                  'aes-128-cbc',
                  Buffer.from(key),
                  Buffer.from('0102030405060708'),
                );
                value = Buffer.concat([
                  decipher.update(Buffer.from(value, 'base64')),
                  decipher.final(),
                ]).toString();
              }
              decoded = JSON.parse(value);
              assert.equal(decoded.csrf_token, 'csrf');
              assert.ok(cookie.includes('os=web'));
            }
            const {
              header: _header,
              checkToken,
              e_r,
              csrf_token: _csrfToken,
              ...data
            } = decoded;
            assert.equal(checkToken, current);
            assert.equal(e_r, false);
            assert.deepEqual(data, expected.data);
          }
          return Response.json(
            mode === 'refusal' ? { code: 403 } : expected.response,
          );
        } catch (error) {
          failures.push(error);
          throw error;
        }
      },
    }).then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
    assert.deepEqual(failures, []);
    if (mode === 'string') {
      assert.equal(result.error.status, 400);
      assert.equal(sent, scenario.method === 'avatarUpload' ? 2 : 1);
    } else if (mode === 'refusal') {
      assert.equal(result.error.status, 403);
      assert.equal(sent, 1);
    } else {
      assert.equal(
        result.error,
        undefined,
        `${scenario.method}/${mode}: ${JSON.stringify(result.error)}`,
      );
      assert.equal(result.value.status, 200);
      assert.equal(sent, scenario.steps.length);
    }
    assert.equal(taken, mode === 'provider' ? 2 : 0);
  }
}
let localProviders = 0;
const local = await client.innerVersion(
  {},
  {
    checkToken: async () => {
      localProviders++;
      throw new Error('local token');
    },
    fetcher: async () => {
      throw new Error('local network');
    },
  },
);
assert.equal(local.status, 200);
assert.equal(local.body.data.version, process.argv[2]);
assert.equal(localProviders, 0);
assert.deepEqual(failures, []);
assert.equal(requests, 21);
assert.equal(providers, 6);
process.stdout.write(
  JSON.stringify({ requests, providers, scenarios: 3, localProviders }),
);
