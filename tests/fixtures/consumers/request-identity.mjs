import assert from 'node:assert/strict';
import { createDecipheriv } from 'node:crypto';

import * as sdk from 'hana-music-api';

import expectedClients from './client-identities.json' with { type: 'json' };

const failures = [];
let requests = 0;
for (const kind of ['client', 'named', 'invoke']) {
  for (const level of ['exhigh', 'sky']) {
    for (const { state, deviceCookie, expected } of [
      {
        state: { deviceId: 'D1' },
        deviceCookie: 'deviceId=D2',
        expected: 'D1',
      },
      { state: { deviceId: 'D1' }, deviceCookie: '', expected: 'D1' },
      { state: undefined, deviceCookie: 'deviceId=D2', expected: 'D2' },
      { state: undefined, deviceCookie: '', expected: undefined },
    ]) {
      const config = {
        state,
        cookie: `MUSIC_U=package-identity; ${deviceCookie}; OS=pc; os=pc; APPVER=old; appver=old; buildver=old; versioncode=140; resolution=desktop`,

        fetcher: async (input, init) => {
          try {
            requests++;
            const request = new Request(input, init);
            assert.equal(
              request.url,
              'https://interface.music.163.com/eapi/song/enhance/player/url/v1',
            );
            assert.equal(request.method, 'POST');
            assert.equal(
              request.headers.get('user-agent'),
              expectedClients.iphone.userAgent,
            );
            const cookies = Object.fromEntries(
              request.headers
                .get('cookie')
                .split('; ')
                .map((part) => {
                  const index = part.indexOf('=');
                  return [
                    part.slice(0, index),
                    decodeURIComponent(part.slice(index + 1)),
                  ];
                }),
            );
            for (const [name, value] of Object.entries({
              ...expectedClients.iphone.cookie,
              MUSIC_U: 'package-identity',
            }))
              assert.equal(cookies[name], value);
            if (expected) assert.equal(cookies.deviceId, expected);
            else assert.match(cookies.deviceId, /^[0-9A-F]{52}$/);
            for (const name of [
              'OS',
              'APPVER',
              'buildver',
              'versioncode',
              'mobilename',
              'resolution',
            ])
              assert.ok(!(name in cookies));
            const params = new URLSearchParams(await request.text()).get(
              'params',
            );
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
            assert.equal(frame[0], '/api/song/enhance/player/url/v1');
            assert.deepEqual(JSON.parse(frame[1]), {
              ids: '[1411594141]',
              level,
              encodeType: 'flac',
              ...(level === 'sky' ? { immerseType: 'c51' } : {}),
              e_r: false,
              header: cookies,
            });
            return Response.json({
              code: 200,
              data: [{ id: 1411594141, url: null, code: 404 }],
            });
          } catch (error) {
            failures.push(error);
            throw error;
          }
        },
      };
      const query = { id: 1411594141, level };
      const result =
        kind === 'client'
          ? await sdk.createHanaMusicApi(config).songUrlV1(query)
          : kind === 'named'
            ? await sdk.songUrlV1(query, config)
            : await sdk.invokeModule('song_url_v1', query, config);
      assert.equal(result.body.data[0].url, null);
    }
  }
}
assert.equal(failures.length, 0, String(failures[0]));
assert.equal(requests, 24);
process.stdout.write(
  JSON.stringify({ requests, entries: 3, levels: 2, devices: 4 }),
);
