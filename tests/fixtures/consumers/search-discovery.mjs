import { strict as assert } from 'node:assert';
import { createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';

import * as sdk from 'hana-music-api';

import expectedClients from './client-identities.json' with { type: 'json' };

Math.random = () => 0;
const baseline = JSON.parse(
  readFileSync(new URL('./search-discovery.json', import.meta.url), 'utf8'),
);
const named = { ...sdk };
let providers = 0;
let total = 0;
const failures = [];
const client = sdk.createHanaMusicApi({ cookie: 'MUSIC_U=package-discovery' });
for (const [index, entry] of baseline.cases.entries()) {
  for (const kind of ['none', 'string', 'provider']) {
    let sends = 0;
    const token = kind === 'none' ? undefined : 'package-discovery-token';
    const config = {
      cookie:
        'MUSIC_U=package-discovery; MUSIC_A=package-anonymous; __csrf=csrf; deviceId=package-device; os=android; appver=conflict',

      checkToken:
        kind === 'provider'
          ? async () => {
              providers++;
              return token;
            }
          : token,
      fetcher: async (input, init) => {
        try {
          const began = Date.now();
          sends++;
          total++;
          assert.equal(sends, 1);
          const request = new Request(input, init);
          assert.equal(request.url, entry.url);
          assert.equal(request.method, 'POST');
          assert.equal(request.headers.get('x-aeapi'), null);
          assert.equal(request.headers.get('X-antiCheatToken'), token ?? null);
          const cookies = Object.fromEntries(
            request.headers
              .get('cookie')
              .split('; ')
              .map((part) => {
                const split = part.indexOf('=');
                return [
                  part.slice(0, split),
                  decodeURIComponent(part.slice(split + 1)),
                ];
              }),
          );
          for (const [name, value] of Object.entries({
            MUSIC_U: 'package-discovery',
            MUSIC_A: 'package-anonymous',
            deviceId: 'package-device',
            ...(entry.profile === 'eapi'
              ? expectedClients.iphone.cookie
              : { os: 'web' }),
          }))
            assert.equal(cookies[name], value);
          for (const name of [
            'buildver',
            'versioncode',
            'mobilename',
            'resolution',
            ...(entry.profile === 'eapi' ? [] : ['appver', 'channel', 'osver']),
          ])
            assert.ok(!(name in cookies));
          assert.ok(
            !request.headers.get('cookie').includes('package-discovery-token'),
          );
          const body = await request.text();
          if (entry.profile === 'eapi') {
            assert.equal(
              request.headers.get('user-agent'),
              expectedClients.iphone.userAgent,
            );
            const decipher = createDecipheriv(
              'aes-128-ecb',
              Buffer.from('e82ckenh8dichen8'),
              null,
            );
            const frame = Buffer.concat([
              decipher.update(
                Buffer.from(new URLSearchParams(body).get('params'), 'hex'),
              ),
              decipher.final(),
            ])
              .toString()
              .split('-36cd479b6b5-');
            assert.equal(frame[0], entry.path);
            const { header, e_r, checkToken, ...data } = JSON.parse(frame[1]);
            if (entry.module === 'aidj_content_rcmd') {
              const info = JSON.parse(data.extInfo);
              const expected = JSON.parse(entry.data.extInfo);
              assert.ok(
                info.lastRequestTimestamp <= Date.now() &&
                  info.lastRequestTimestamp >= began - 1000,
              );
              expected.lastRequestTimestamp = info.lastRequestTimestamp;
              if (info.lbsInfoList) {
                assert.ok(
                  info.lbsInfoList[0].time <= Math.floor(Date.now() / 1000) &&
                    info.lbsInfoList[0].time >= Math.floor(began / 1000) - 1,
                );
                expected.lbsInfoList[0].time = info.lbsInfoList[0].time;
              }
              assert.deepEqual(info, expected);
              assert.deepEqual(Object.keys(data), ['extInfo']);
            } else {
              assert.deepEqual(
                data,
                entry.module === 'homepage_block_page' &&
                  entry.label === 'refresh-string'
                  ? { ...entry.data, refresh: false }
                  : entry.data,
              );
            }
            assert.equal(e_r, false);
            assert.equal(checkToken, token);
            assert.deepEqual(header, {
              ...cookies,
              ...(token ? { 'X-antiCheatToken': token } : {}),
            });
          } else {
            assert.equal(
              request.headers.get('user-agent'),
              expectedClients.web.userAgent,
            );
            assert.equal(
              request.headers.get('referer'),
              'https://music.163.com',
            );
            let decoded = new URLSearchParams(body).get('params');
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
            const { e_r, csrf_token, checkToken, ...data } =
              JSON.parse(decoded);
            assert.equal(e_r, false);
            assert.equal(csrf_token, 'csrf');
            assert.equal(checkToken, token);
            assert.deepEqual(
              data,
              entry.module === 'homepage_block_page' &&
                entry.label === 'refresh-string'
                ? { ...entry.data, refresh: false }
                : entry.data,
            );
          }
          return Response.json({ code: 403, msg: 'package-refusal' });
        } catch (error) {
          failures.push(error);
          throw error;
        }
      },
    };
    const pending =
      index % 3 === 0
        ? client[entry.method](entry.query, config)
        : index % 3 === 1
          ? named[entry.method](entry.query, config)
          : sdk.invokeModule(entry.module, entry.query, config);
    assert.ok(pending instanceof Promise);
    const outcome = await pending.then(
      (resolved) => ({ resolved }),
      (rejected) => ({ rejected }),
    );
    if (outcome.rejected?.status === 400)
      console.error('BAD', entry.module, JSON.stringify(entry.query));
    assert.deepEqual(outcome, {
      rejected: {
        status: 403,
        body: { code: 403, msg: 'package-refusal' },
        cookie: [],
        failure: {
          kind: 'business',
          code: 403,
          message: 'package-refusal',
        },
      },
    });
    assert.equal(sends, 1);
  }
}
assert.deepEqual(failures, []);
assert.equal(providers, baseline.cases.length);
assert.equal(total, baseline.cases.length * 3);
process.stdout.write(
  JSON.stringify({
    requests: total,
    providers,
    cases: baseline.cases.length,
    modules: new Set(baseline.cases.map((entry) => entry.module)).size,
  }),
);
