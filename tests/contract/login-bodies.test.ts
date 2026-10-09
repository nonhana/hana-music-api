import { expect, test } from 'bun:test';

import type { NcmApiResponse } from '../../index.ts';
import { createHanaMusicApi, LoginCellphoneRiskBody } from '../../index.ts';
import captchaSent from '../fixtures/netease/login/captcha_sent.json';
import smsLogin from '../fixtures/netease/login/login_cellphone.200.json';
import smsRisk from '../fixtures/netease/login/login_cellphone.10004-risk.json';
import expired from '../fixtures/netease/login/login_qr_check.800-expired.json';
import waiting from '../fixtures/netease/login/login_qr_check.801-waiting.json';
import scanned from '../fixtures/netease/login/login_qr_check.802-scanned.json';
import authorized from '../fixtures/netease/login/login_qr_check.803-success.json';
import qrCreated from '../fixtures/netease/login/login_qr_create.json';
import qrKey from '../fixtures/netease/login/login_qr_key.json';
import refreshQr from '../fixtures/netease/login/login_refresh.qr.json';
import refreshSms from '../fixtures/netease/login/login_refresh.sms.json';
import statusAnonymous from '../fixtures/netease/login/login_status.anonymous.json';
import statusVip from '../fixtures/netease/login/login_status.vip.json';
import loggedOut from '../fixtures/netease/login/logout.json';
import accountAnonymous from '../fixtures/netease/login/user_account.anonymous.json';
import accountInvalid from '../fixtures/netease/login/user_account.invalid-cookie.json';
import accountVip from '../fixtures/netease/login/user_account.vip.json';
import detailVip from '../fixtures/netease/login/user_detail.vip.json';

type Recording = {
  readonly query: Record<string, unknown>;
  readonly response: { readonly status: number; readonly body: object };
};

// 每个用例回放一份验证关卡录下、脱敏后的网易云返回（Campanula 验证关卡①，nonhana/hana-music-api#18）。
const replay = (upstream: unknown, setCookie: ReadonlyArray<string> = []) => {
  const headers = new Headers();
  for (const cookie of setCookie) {
    headers.append('set-cookie', cookie);
  }
  return createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { headers }),
  });
};

const settle = <Value>(promise: Promise<Value>) =>
  promise.then(
    (resolved) => ({ resolved }),
    (rejected: NcmApiResponse) => ({ rejected }),
  );

const withoutCookie = ({ cookie: _cookie, ...body }: Record<string, unknown>) =>
  body;

// 录制时 SDK 已经把 Set-Cookie 拼进 body.cookie（脱敏为空串），回放时去掉它，让 SDK 自己再拼一次。
test.each<{ name: string; recording: Recording }>([
  { name: '800 expired', recording: expired },
  { name: '801 waiting', recording: waiting },
  { name: '802 scanned', recording: scanned },
  { name: '803 authorized', recording: authorized },
])(
  'loginQrCheck returns the recorded $name body, keeping undeclared fields',
  async ({ recording }) => {
    const result = await replay(withoutCookie({ ...recording.response.body }), [
      'MUSIC_U=fresh; Path=/',
    ]).loginQrCheck({ key: String(recording.query.key) });

    expect(result.status).toBe(200);
    expect(result.body as unknown).toEqual({
      ...recording.response.body,
      cookie: 'MUSIC_U=fresh; Path=/',
    });
  },
);

test('loginQrKey returns the recorded key', async () => {
  const result = await replay(qrKey.response.body.data).loginQrKey();

  expect(result as unknown).toEqual({
    status: 200,
    cookie: [],
    body: qrKey.response.body,
  });
});

test('loginQrCreate builds the recorded login link and image', async () => {
  const result = await replay({}).loginQrCreate(qrCreated.query);

  expect(result.body as unknown).toEqual(qrCreated.response.body);
});

test('verifyGetQr builds the verification page link from NetEase’s code', async () => {
  const result = await replay({
    code: 200,
    data: { qrCode: 'abc' },
  }).verifyGetQr({
    vid: 'v',
    type: 2,
    token: 't',
    evid: 'e',
    sign: 's',
  });

  expect(result.body.data.qrCode).toBe('abc');
  expect(result.body.data.qrurl).toBe(
    'https://st.music.163.com/encrypt-pages?qrCode=abc&verifyToken=t&verifyId=v&verifyType=2&params={"event_id":"e","sign":"s"}',
  );
  expect(result.body.data.qrimg).toStartWith('data:image/png;base64,');
});

test('loginQrCheck hands an unrecorded code back as NetEase’s own rejection', async () => {
  const upstream = { code: 8821, message: '需要行为验证码验证', token: 't' };

  expect(await settle(replay(upstream).loginQrCheck({ key: 'k' }))).toEqual({
    rejected: { status: 400, cookie: [], body: upstream },
  });
});

test('captchaSent returns the recorded confirmation', async () => {
  const result = await replay(captchaSent.response.body).captchaSent(
    captchaSent.query,
  );

  expect(result.body as unknown).toEqual(captchaSent.response.body);
});

test('loginCellphone returns the recorded account with its credential cookie', async () => {
  const result = await replay(withoutCookie(smsLogin.response.body), [
    'MUSIC_U=fresh; Path=/',
  ]).loginCellphone({ phone: '<phone>', captcha: '<captcha>' });

  expect(result.body as unknown).toEqual({
    ...smsLogin.response.body,
    cookie: 'MUSIC_U=fresh; Path=/',
  });
});

test('loginCellphone passes the risk-control rejection through, matching the exported shape', async () => {
  const outcome = await settle(
    replay(smsRisk.response.body).loginCellphone({
      phone: '<phone>',
      captcha: '<captcha>',
    }),
  );

  expect(outcome).toEqual({
    rejected: { status: 400, cookie: [], body: smsRisk.response.body },
  });
  expect(
    LoginCellphoneRiskBody['~standard'].validate(
      'rejected' in outcome ? outcome.rejected.body : undefined,
    ) as unknown,
  ).toEqual({ value: smsRisk.response.body });
});

test.each<{ name: string; recording: Recording }>([
  { name: 'member', recording: accountVip },
  { name: 'anonymous', recording: accountAnonymous },
  { name: 'expired credential', recording: accountInvalid },
])('userAccount returns the recorded $name account', async ({ recording }) => {
  const result = await replay(recording.response.body).userAccount();

  expect(result.body as unknown).toEqual(recording.response.body);
});

test.each<{ name: string; recording: Recording }>([
  { name: 'member', recording: statusVip },
  { name: 'anonymous', recording: statusAnonymous },
])('loginStatus wraps the recorded $name account', async ({ recording }) => {
  const upstream = (recording.response.body as { data: unknown }).data;

  const result = await replay(upstream).loginStatus();

  expect(result.body as unknown).toEqual(recording.response.body);
});

test('userDetail returns the recorded profile', async () => {
  const result = await replay(detailVip.response.body).userDetail(
    detailVip.query,
  );

  expect(result.body as unknown).toEqual(detailVip.response.body);
});

test.each<{ name: string; recording: Recording }>([
  { name: 'QR-login', recording: refreshQr },
  { name: 'SMS-login', recording: refreshSms },
])(
  'loginRefresh renews a $name credential and returns the new cookie',
  async ({ recording }) => {
    const result = await replay(withoutCookie({ ...recording.response.body }), [
      'MUSIC_U=renewed; Max-Age=15552000',
    ]).loginRefresh();

    expect(result.body as unknown).toEqual({
      ...recording.response.body,
      cookie: 'MUSIC_U=renewed; Max-Age=15552000',
    });
  },
);

test('loginRefresh hands an expired login’s rejection back unchanged', async () => {
  const upstream = { code: 301, msg: '需要登录' };

  expect(await settle(replay(upstream).loginRefresh())).toEqual({
    rejected: { status: 301, cookie: [], body: upstream },
  });
});

test('logout returns the recorded confirmation', async () => {
  const result = await replay(loggedOut.response.body).logout();

  expect(result.body as unknown).toEqual(loggedOut.response.body);
});

test.each<{
  name: string;
  call: () => Promise<unknown>;
  shape: Record<'module' | 'path' | 'expected' | 'actual', string>;
}>([
  {
    name: 'loginQrCheck: scanned without the nickname',
    call: () => {
      const { nickname: _nickname, ...upstream } = withoutCookie(
        scanned.response.body,
      );
      return replay(upstream).loginQrCheck(scanned.query);
    },
    shape: {
      module: 'login_qr_check',
      path: 'body.nickname',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'loginQrCheck: a non-object body',
    call: () => replay('busy').loginQrCheck({ key: 'k' }),
    shape: {
      module: 'login_qr_check',
      path: 'body',
      expected:
        '{ readonly "code": 800, ... } | { readonly "code": 801, ... } | { readonly "code": 802, ... } | { readonly "code": 803, ... }',
      actual: 'string',
    },
  },
  {
    name: 'loginQrKey: the key is not a string',
    call: () => replay({ code: 200, unikey: 42 }).loginQrKey(),
    shape: {
      module: 'login_qr_key',
      path: 'body.data.unikey',
      expected: 'string',
      actual: 'number',
    },
  },
  {
    name: 'verifyGetQr: no verification code',
    call: () => replay({ code: 200, data: {} }).verifyGetQr({}),
    shape: {
      module: 'verify_getQr',
      path: 'body.data.qrCode',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'captchaSent: data is not a boolean',
    call: () =>
      replay({ code: 200, data: 'yes' }).captchaSent(captchaSent.query),
    shape: {
      module: 'captcha_sent',
      path: 'body.data',
      expected: 'boolean',
      actual: 'string',
    },
  },
  {
    name: 'loginCellphone: success without a profile',
    call: () => {
      const { profile: _profile, ...upstream } = withoutCookie(
        smsLogin.response.body,
      );
      return replay(upstream, ['MUSIC_U=fresh']).loginCellphone({
        phone: '<phone>',
        captcha: '<captcha>',
      });
    },
    shape: {
      module: 'login_cellphone',
      path: 'body.profile',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'userAccount: vipType is not a number',
    call: () =>
      replay({
        ...accountVip.response.body,
        account: { ...accountVip.response.body.account, vipType: '11' },
      }).userAccount(),
    shape: {
      module: 'user_account',
      path: 'body.account.vipType',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'loginStatus: profile is neither an object nor null',
    call: () =>
      replay({ ...statusVip.response.body.data, profile: [] }).loginStatus(),
    shape: {
      module: 'login_status',
      path: 'body.data.profile',
      expected: 'object | null',
      actual: 'array',
    },
  },
  {
    name: 'userDetail: profile without a nickname',
    call: () => {
      const { nickname: _nickname, ...profile } =
        detailVip.response.body.profile;
      return replay({ ...detailVip.response.body, profile }).userDetail(
        detailVip.query,
      );
    },
    shape: {
      module: 'user_detail',
      path: 'body.profile.nickname',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'loginRefresh: no code at all',
    call: () => replay({ bizCode: '200' }).loginRefresh(),
    shape: {
      module: 'login_refresh',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'logout: a non-object body',
    call: () => replay(null).logout(),
    shape: {
      module: 'logout',
      path: 'body',
      expected: 'object',
      actual: 'null',
    },
  },
])('$name rejects as an upstream shape change', async ({ call, shape }) => {
  expect(await settle(call())).toEqual({
    rejected: {
      status: 502,
      cookie: [],
      body: {
        code: 502,
        msg: `Unexpected upstream shape in ${shape.module} at ${shape.path}: expected ${shape.expected}, got ${shape.actual}`,
        upstreamShape: shape,
      },
    },
  });
});
