import { strict as assert } from 'node:assert';
import { createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';

import * as sdk from 'hana-music-api';

import expectedClients from './client-identities.json' with { type: 'json' };

const baseline = JSON.parse(
  readFileSync(new URL('./account-social.json', import.meta.url), 'utf8'),
);
const named = { ...sdk };
let providers = 0;
let total = 0;
const failures = [];
const client = sdk.createHanaMusicApi({ cookie: 'MUSIC_U=package-account' });
for (const [index, entry] of baseline.cases.entries()) {
  for (const kind of ['none', 'string', 'provider']) {
    let sends = 0;
    const token = kind === 'none' ? undefined : 'package-account-token';
    const config = {
      cookie:
        'MUSIC_U=package-account; MUSIC_A=package-anonymous; __csrf=csrf; deviceId=package-device; os=android; appver=conflict',

      checkToken:
        kind === 'provider'
          ? async () => {
              providers++;
              return token;
            }
          : token,
      fetcher: async (input, init) => {
        try {
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
            MUSIC_U: 'package-account',
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
            !request.headers.get('cookie').includes('package-account-token'),
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
            assert.deepEqual(data, entry.data);
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
            assert.ok(new URLSearchParams(body).has('params'));
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
