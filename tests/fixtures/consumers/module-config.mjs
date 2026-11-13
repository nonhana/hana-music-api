import { strict as assert } from 'node:assert';
import { createDecipheriv } from 'node:crypto';

import * as sdk from 'hana-music-api';

import expectedClients from './client-identities.json' with { type: 'json' };

const removed = {
  crypto: 'api',
  ua: 'old',
  domain: 'https://external.example',
  e_r: true,
  acceptGzip: true,
  headers: { Cookie: 'old' },
  deviceId: 'old',
};
const client = sdk.createHanaMusicApi();
let rejectedCalls = 0;
let rejectedConstructors = 0;
let queryRejections = 0;
let sends = 0;
let providers = 0;
for (const [key, value] of Object.entries(removed)) {
  for (const supplied of [value, undefined]) {
    const config = {
      [key]: supplied,
      fetcher: async () => {
        sends++;
        return Response.json({ code: 200 });
      },
      checkToken: async () => {
        providers++;
        return 'unused';
      },
    };
    for (const call of [
      () => sdk.innerVersion({}, config),
      () => client.innerVersion({}, config),
      () => sdk.invokeModule('inner_version', {}, config),
    ]) {
      await assert.rejects(call(), (error) => error.status === 400);
      rejectedCalls++;
    }
    assert.throws(() => sdk.createHanaMusicApi(config), TypeError);
    rejectedConstructors++;
  }
  await assert.rejects(
    sdk.innerVersion({ [key]: value }),
    (error) => error.status === 400,
  );
  queryRejections++;
}
let nonEnumerableRejections = 0;
for (const key of Object.keys(removed))
  for (const value of [removed[key], undefined]) {
    const config = Object.defineProperty({}, key, { value, enumerable: false });
    for (const call of [
      () => sdk.innerVersion({}, config),
      () => client.innerVersion({}, config),
      () => sdk.invokeModule('inner_version', {}, config),
    ]) {
      await assert.rejects(call(), (error) => error.status === 400);
      nonEnumerableRejections++;
    }
  }
assert.equal(sends, 0);
assert.equal(providers, 0);
await assert.rejects(
  sdk.innerVersion({}, sdk.createOption({ crypto: 'weapi' })),
  (error) => error.status === 400,
);

Math.random = () => 0;
const failures = [];
for (const [index, call] of [
  (config) => sdk.lyric({ id: 101 }, config),
  (config) => client.lyric({ id: 202 }, config),
  (config) => sdk.invokeModule('lyric', { id: 303 }, config),
].entries()) {
  const account = `account-${index}`;
  const device = `device-${index}`;
  const result = await call({
    cookie: `MUSIC_U=${account}; deviceId=stale; OS=pc; appver=old`,
    state: { deviceId: device },
    fetcher: async (input, init) => {
      try {
        sends++;
        assert.equal(
          input instanceof Request ? input.url : input.toString(),
          'https://music.163.com/weapi/song/lyric',
        );
        assert.equal(init.method, 'POST');
        const headers = new Headers(init.headers);
        assert.equal(headers.get('User-Agent'), expectedClients.web.userAgent);
        const cookies = Object.fromEntries(
          headers
            .get('cookie')
            .split('; ')
            .map((entry) => {
              const position = entry.indexOf('=');
              return [
                entry.slice(0, position),
                decodeURIComponent(entry.slice(position + 1)),
              ];
            }),
        );
        assert.equal(cookies.deviceId, device);
        assert.equal(cookies.MUSIC_U, account);
        assert.equal(cookies.os, 'web');
        assert.equal(cookies.appver, undefined);
        assert.equal(cookies.OS, undefined);
        let decoded = new URLSearchParams(init.body).get('params');
        for (const key of ['aaaaaaaaaaaaaaaa', '0CoJUm6Qyw8W8jud']) {
          const decipher = createDecipheriv(
            'aes-128-cbc',
            Buffer.from(key),
            Buffer.from('0102030405060708'),
          );
          decoded = Buffer.concat([
            decipher.update(Buffer.from(decoded, 'base64')),
            decipher.final(),
          ]).toString();
        }
        const data = JSON.parse(decoded);
        assert.equal(String(data.id), String((index + 1) * 101));
        assert.equal(data.e_r, false);
        assert.equal(data.csrf_token, '');
        assert.equal(data.header, undefined);
        return Response.json({
          code: 200,
          lrc: { lyric: `${account}/${device}` },
        });
      } catch (error) {
        failures.push(error);
        throw error;
      }
    },
  });
  assert.equal(result.body.lrc.lyric, `${account}/${device}`);
}
let rawSends = 0;
await sdk.createRequest(
  '/api/raw/probe',
  {},
  sdk.createOption({
    crypto: 'api',
    ua: 'raw-client',
    headers: { 'X-Raw': 'preserved' },
    cookie: 'MUSIC_U=raw; os=pc',
    state: { deviceId: 'raw-device' },
    fetcher: async (input, init) => {
      try {
        rawSends++;
        assert.equal(
          input instanceof Request ? input.url : input.toString(),
          'https://interface.music.163.com/api/raw/probe',
        );
        assert.equal(new Headers(init.headers).get('User-Agent'), 'raw-client');
        assert.equal(new Headers(init.headers).get('X-Raw'), 'preserved');
        assert.ok(new Headers(init.headers).get('cookie').includes('os=pc'));
        return Response.json({ code: 200 });
      } catch (error) {
        failures.push(error);
        throw error;
      }
    },
  }),
);
assert.deepEqual(failures, []);
assert.equal(sends, 3);
assert.equal(rawSends, 1);
process.stdout.write(
  JSON.stringify({
    removedKeys: 7,
    rejectedCalls,
    rejectedConstructors,
    nonEnumerableRejections,
    queryRejections,
    requests: sends,
    rawRequests: rawSends,
    providers,
  }),
);
