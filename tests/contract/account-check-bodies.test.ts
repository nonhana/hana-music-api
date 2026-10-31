import { expect, expectTypeOf, test } from 'bun:test';

import {
  CellphoneExistenceCheckBody,
  CountriesCodeListBody,
  createHanaMusicApi,
  GetUseridsBody,
  NicknameCheckBody,
  PlCountBody,
  VerifyQrcodestatusBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import countriesCodeList from '../fixtures/netease/other/countries_code_list.default.json';
import plCountAnonymous from '../fixtures/netease/other/pl_count.anonymous.json';
import plCount from '../fixtures/netease/other/pl_count.default.json';
import verifyQrcodestatusAnonymous from '../fixtures/netease/other/verify_qrcodestatus.anonymous.json';
import verifyQrcodestatusEmpty from '../fixtures/netease/other/verify_qrcodestatus.empty.json';
import verifyQrcodestatusExpired from '../fixtures/netease/other/verify_qrcodestatus.expired.json';
import cellphoneExistenceCheck from '../fixtures/netease/user/cellphone_existence_check.default.json';
import cellphoneExistenceCheckUnregistered from '../fixtures/netease/user/cellphone_existence_check.unregistered.json';
import getUserids from '../fixtures/netease/user/get_userids.default.json';
import getUseridsMulti from '../fixtures/netease/user/get_userids.multi.json';
import getUseridsNoMatch from '../fixtures/netease/user/get_userids.no-match.json';
import nicknameCheck from '../fixtures/netease/user/nickname_check.default.json';
import nicknameCheckDuplicated from '../fixtures/netease/user/nickname_check.duplicated.json';

// issue #102 B39 的录制：账号校验与基础查询。登录对照先确认 login_status 的
// account.anonimousUser 为 false；verify_qrcodestatus 没有可构造的扫码会话，只录到已失效
// 二维码（qrCodeStatus 21），未扫/已扫/已确认三态没有证据。
type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly expectedBody?: unknown;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ readonly status: number; readonly body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'cellphone_existence_check for a registered number',
    recording: cellphoneExistenceCheck,
    bodySchema: CellphoneExistenceCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).cellphoneExistenceCheck(
        cellphoneExistenceCheck.query,
      ),
  },
  {
    name: 'cellphone_existence_check for an unregistered number',
    recording: cellphoneExistenceCheckUnregistered,
    bodySchema: CellphoneExistenceCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).cellphoneExistenceCheck(
        cellphoneExistenceCheckUnregistered.query,
      ),
  },
  {
    name: 'nickname_check for an available nickname',
    recording: nicknameCheck,
    bodySchema: NicknameCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).nicknameCheck(nicknameCheck.query),
  },
  {
    name: 'nickname_check for a duplicated nickname',
    recording: nicknameCheckDuplicated,
    bodySchema: NicknameCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).nicknameCheck(nicknameCheckDuplicated.query),
  },
  {
    name: 'get_userids for an existing nickname',
    recording: getUserids,
    bodySchema: GetUseridsBody,
    call: (upstream, status) =>
      replay(upstream, status).getUserids(getUserids.query),
  },
  {
    name: 'get_userids for existing and missing nicknames',
    recording: getUseridsMulti,
    bodySchema: GetUseridsBody,
    call: (upstream, status) =>
      replay(upstream, status).getUserids(getUseridsMulti.query),
  },
  {
    name: 'get_userids for a missing nickname',
    recording: getUseridsNoMatch,
    bodySchema: GetUseridsBody,
    call: (upstream, status) =>
      replay(upstream, status).getUserids(getUseridsNoMatch.query),
  },
  {
    name: 'countries_code_list',
    recording: countriesCodeList,
    bodySchema: CountriesCodeListBody,
    call: (upstream, status) =>
      replay(upstream, status).countriesCodeList(countriesCodeList.query),
  },
  {
    name: 'verify_qrcodestatus for an expired code',
    recording: verifyQrcodestatusExpired,
    bodySchema: VerifyQrcodestatusBody,
    expectedBody: { ...verifyQrcodestatusExpired.response.body, code: 200 },
    call: (upstream, status) =>
      replay(upstream, status).verifyQrcodestatus(
        verifyQrcodestatusExpired.query,
      ),
  },
  {
    name: 'pl_count',
    recording: plCount,
    bodySchema: PlCountBody,
    call: (upstream, status) => replay(upstream, status).plCount(plCount.query),
  },
  {
    name: 'pl_count anonymously',
    recording: plCountAnonymous,
    bodySchema: PlCountBody,
    call: (upstream, status) =>
      replay(upstream, status).plCount(plCountAnonymous.query),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(entry.recording.response.status);
  expect(result.body).toEqual(
    entry.expectedBody ?? entry.recording.response.body,
  );

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test.each([
  { name: 'an empty qr', recording: verifyQrcodestatusEmpty },
  { name: 'an anonymous call', recording: verifyQrcodestatusAnonymous },
])(
  'verify_qrcodestatus rejects $name with the upstream code',
  async ({ recording }) => {
    const code = Number(recording.response.body.code);

    expect(
      await settle(
        replay(recording.response.body).verifyQrcodestatus(recording.query),
      ),
    ).toEqual({
      rejected: {
        status: code,
        cookie: [],
        body: { ...recording.response.body, code },
      },
    });
  },
);

test('account check bodies type their tightened records and loose fields', () => {
  expectTypeOf<CellphoneExistenceCheckBody['exist']>().toEqualTypeOf<number>();
  expectTypeOf<CellphoneExistenceCheckBody['hasPassword']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<NicknameCheckBody['duplicated']>().toEqualTypeOf<boolean>();
  expectTypeOf<NicknameCheckBody['candidateNicknames']>().toEqualTypeOf<
    ReadonlyArray<string> | null | undefined
  >();
  expectTypeOf<GetUseridsBody['nicknames']>().toEqualTypeOf<{
    readonly [nickname: string]: number;
  }>();
  expectTypeOf<
    CountriesCodeListBody['data'][number]['countryList'][number]['code']
  >().toEqualTypeOf<string>();
  expectTypeOf<CountriesCodeListBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  // 字符串分支只用于校验归一前的原始录制；请求层返回的 code 恒为数字 200。
  expectTypeOf<VerifyQrcodestatusBody['code']>().toEqualTypeOf<200 | '200'>();
  expectTypeOf<
    VerifyQrcodestatusBody['data']['qrCodeStatus']
  >().toEqualTypeOf<number>();
  expectTypeOf<VerifyQrcodestatusBody['data']['detailReason']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<PlCountBody['msg']>().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<PlCountBody['pushMsg']>().toEqualTypeOf<
    string | null | undefined
  >();
});

test('account check modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.cellphoneExistenceCheck(null as never),
    () => api.nicknameCheck(null as never),
    () => api.getUserids(null as never),
    () => api.countriesCodeList(null as never),
    () => api.verifyQrcodestatus(null as never),
    () => api.plCount(null as never),
  ];

  for (const call of calls) {
    expect(await settle(call())).toEqual({
      rejected: {
        status: 400,
        cookie: [],
        body: { code: 400, msg: 'Expected <Declaration>' },
      },
    });
  }
  expect(upstreamCalls).toBe(0);
});

test('cellphone_existence_check rejects a body without the existence flag', async () => {
  const upstream = structuredClone(cellphoneExistenceCheck.response.body) as {
    exist?: unknown;
  };
  delete upstream.exist;

  await expectUpstreamShapeRejection(
    replay(upstream).cellphoneExistenceCheck(cellphoneExistenceCheck.query),
    {
      module: 'cellphone_existence_check',
      path: 'body.exist',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('cellphone_existence_check rejects a non-numeric existence flag', async () => {
  const upstream = structuredClone(cellphoneExistenceCheck.response.body) as {
    exist: unknown;
  };
  upstream.exist = '1';

  await expectUpstreamShapeRejection(
    replay(upstream).cellphoneExistenceCheck(cellphoneExistenceCheck.query),
    {
      module: 'cellphone_existence_check',
      path: 'body.exist',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('cellphone_existence_check drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(cellphoneExistenceCheck.response.body) as {
    hasPassword: unknown;
    nickname: unknown;
    extra?: unknown;
  };
  upstream.hasPassword = 'true';
  upstream.nickname = null;
  upstream.extra = { masked: true };

  const result = await replay(upstream).cellphoneExistenceCheck(
    cellphoneExistenceCheck.query,
  );

  expect(result.body as unknown).not.toHaveProperty('hasPassword');
  expect(result.body as unknown).toHaveProperty('nickname', null);
  expect(result.body as unknown).toHaveProperty('extra', { masked: true });
});

test('nickname_check rejects a body without the duplicate flag', async () => {
  const upstream = structuredClone(nicknameCheck.response.body) as {
    duplicated?: unknown;
  };
  delete upstream.duplicated;

  await expectUpstreamShapeRejection(
    replay(upstream).nicknameCheck(nicknameCheck.query),
    {
      module: 'nickname_check',
      path: 'body.duplicated',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('nickname_check rejects a non-boolean duplicate flag', async () => {
  const upstream = structuredClone(nicknameCheck.response.body) as {
    duplicated: unknown;
  };
  upstream.duplicated = 'false';

  await expectUpstreamShapeRejection(
    replay(upstream).nicknameCheck(nicknameCheck.query),
    {
      module: 'nickname_check',
      path: 'body.duplicated',
      expected: 'boolean',
      actual: 'string',
    },
  );
});

test('nickname_check accepts a missing or null candidate list', async () => {
  const missing = structuredClone(nicknameCheckDuplicated.response.body) as {
    candidateNicknames?: unknown;
  };
  delete missing.candidateNicknames;

  const missingResult = await replay(missing).nicknameCheck(
    nicknameCheckDuplicated.query,
  );
  expect(missingResult.status).toBe(200);
  expect(missingResult.body as unknown).not.toHaveProperty(
    'candidateNicknames',
  );

  const nulled = structuredClone(nicknameCheckDuplicated.response.body) as {
    candidateNicknames: unknown;
  };
  nulled.candidateNicknames = null;

  const nullResult = await replay(nulled).nicknameCheck(
    nicknameCheckDuplicated.query,
  );
  expect(nullResult.status).toBe(200);
  expect(nullResult.body as unknown).toHaveProperty('candidateNicknames', null);
});

test('nickname_check rejects a bad candidate nickname', async () => {
  const upstream = structuredClone(nicknameCheckDuplicated.response.body) as {
    candidateNicknames: Array<unknown>;
  };
  upstream.candidateNicknames[1] = 3;

  await expectUpstreamShapeRejection(
    replay(upstream).nicknameCheck(nicknameCheckDuplicated.query),
    {
      module: 'nickname_check',
      path: 'body.candidateNicknames[1]',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('nickname_check drops a bad loose nickname and keeps undeclared fields', async () => {
  const upstream = structuredClone(nicknameCheck.response.body) as {
    nickname: unknown;
    extra?: unknown;
  };
  upstream.nickname = 42;
  upstream.extra = { attempted: 'non_h' };

  const result = await replay(upstream).nicknameCheck(nicknameCheck.query);

  expect(result.body as unknown).not.toHaveProperty('nickname');
  expect(result.body as unknown).toHaveProperty('extra', {
    attempted: 'non_h',
  });
});

test('get_userids rejects a body without the nickname mapping', async () => {
  const upstream = structuredClone(getUserids.response.body) as {
    nicknames?: unknown;
  };
  delete upstream.nicknames;

  await expectUpstreamShapeRejection(
    replay(upstream).getUserids(getUserids.query),
    {
      module: 'get_userids',
      path: 'body.nicknames',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('get_userids rejects a non-numeric user id', async () => {
  const upstream = structuredClone(getUserids.response.body) as {
    nicknames: Record<string, unknown>;
  };
  upstream.nicknames.non_h = '599663130';

  await expectUpstreamShapeRejection(
    replay(upstream).getUserids(getUserids.query),
    {
      module: 'get_userids',
      path: 'body.nicknames.non_h',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('get_userids keeps an empty mapping and undeclared fields', async () => {
  const upstream = structuredClone(getUseridsNoMatch.response.body) as Record<
    string,
    unknown
  >;
  upstream.extra = { queried: 1 };

  const result = await replay(upstream).getUserids(getUseridsNoMatch.query);

  expect(result.body as unknown).toHaveProperty('nicknames', {});
  expect(result.body as unknown).toHaveProperty('extra', { queried: 1 });
});

test('countries_code_list rejects a body without the country groups', async () => {
  const upstream = structuredClone(countriesCodeList.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).countriesCodeList(countriesCodeList.query),
    {
      module: 'countries_code_list',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('countries_code_list rejects a country without its code', async () => {
  const upstream = structuredClone(countriesCodeList.response.body) as {
    data: Array<{ countryList: Array<{ code?: unknown }> }>;
  };
  delete upstream.data[0]!.countryList[0]!.code;

  await expectUpstreamShapeRejection(
    replay(upstream).countriesCodeList(countriesCodeList.query),
    {
      module: 'countries_code_list',
      path: 'body.data[0].countryList[0].code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('countries_code_list rejects a non-array country group list', async () => {
  const upstream = structuredClone(countriesCodeList.response.body) as {
    data: unknown;
  };
  upstream.data = 'countries';

  await expectUpstreamShapeRejection(
    replay(upstream).countriesCodeList(countriesCodeList.query),
    {
      module: 'countries_code_list',
      path: 'body.data',
      expected: 'array',
      actual: 'string',
    },
  );
});

test('countries_code_list rejects a non-array country list', async () => {
  const upstream = structuredClone(countriesCodeList.response.body) as {
    data: Array<{ countryList: unknown }>;
  };
  upstream.data[0]!.countryList = null;

  await expectUpstreamShapeRejection(
    replay(upstream).countriesCodeList(countriesCodeList.query),
    {
      module: 'countries_code_list',
      path: 'body.data[0].countryList',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('countries_code_list rejects a non-string country code', async () => {
  const upstream = structuredClone(countriesCodeList.response.body) as {
    data: Array<{ countryList: Array<{ code: unknown }> }>;
  };
  upstream.data[0]!.countryList[0]!.code = 86;

  await expectUpstreamShapeRejection(
    replay(upstream).countriesCodeList(countriesCodeList.query),
    {
      module: 'countries_code_list',
      path: 'body.data[0].countryList[0].code',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('countries_code_list drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(countriesCodeList.response.body) as {
    message: unknown;
    data: Array<{
      label: unknown;
      countryList: Array<{
        zh: unknown;
        extra?: unknown;
      }>;
    }>;
  };
  upstream.message = 200;
  upstream.data[0]!.label = 42;
  upstream.data[0]!.countryList[0]!.zh = null;
  upstream.data[0]!.countryList[0]!.extra = { region: 'asia' };

  const result = await replay(upstream).countriesCodeList(
    countriesCodeList.query,
  );
  const group = result.body.data[0] as unknown as {
    label?: unknown;
    countryList: Array<Record<string, unknown>>;
  };

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(group).not.toHaveProperty('label');
  expect(group.countryList[0]).toHaveProperty('zh', null);
  expect(group.countryList[0]).toHaveProperty('extra', { region: 'asia' });
});

test('verify_qrcodestatus rejects a body without the status payload', async () => {
  const upstream = structuredClone(verifyQrcodestatusExpired.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).verifyQrcodestatus(verifyQrcodestatusExpired.query),
    {
      module: 'verify_qrcodestatus',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('verify_qrcodestatus rejects a non-numeric scan status', async () => {
  const upstream = structuredClone(verifyQrcodestatusExpired.response.body) as {
    data: { qrCodeStatus: unknown };
  };
  upstream.data.qrCodeStatus = '21';

  await expectUpstreamShapeRejection(
    replay(upstream).verifyQrcodestatus(verifyQrcodestatusExpired.query),
    {
      module: 'verify_qrcodestatus',
      path: 'body.data.qrCodeStatus',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('verify_qrcodestatus treats detailReason as loose for missing, null and wrong types', async () => {
  const missing = structuredClone(verifyQrcodestatusExpired.response.body) as {
    data: { detailReason?: unknown };
  };
  delete missing.data.detailReason;

  const missingResult = await replay(missing).verifyQrcodestatus(
    verifyQrcodestatusExpired.query,
  );
  expect(missingResult.body.data as unknown).not.toHaveProperty('detailReason');
  expect(missingResult.body.data.qrCodeStatus).toBe(21);

  const nulled = structuredClone(verifyQrcodestatusExpired.response.body) as {
    data: { detailReason: unknown };
  };
  nulled.data.detailReason = null;

  const nullResult = await replay(nulled).verifyQrcodestatus(
    verifyQrcodestatusExpired.query,
  );
  expect(nullResult.body.data as unknown).toHaveProperty('detailReason', null);

  const bad = structuredClone(verifyQrcodestatusExpired.response.body) as {
    data: { detailReason: unknown };
  };
  bad.data.detailReason = '0';

  const badResult = await replay(bad).verifyQrcodestatus(
    verifyQrcodestatusExpired.query,
  );
  expect(badResult.body.data as unknown).not.toHaveProperty('detailReason');
  expect(badResult.body.data.qrCodeStatus).toBe(21);
});

test('verify_qrcodestatus drops a bad loose message and keeps undeclared fields', async () => {
  const upstream = structuredClone(verifyQrcodestatusExpired.response.body) as {
    message: unknown;
    extra?: unknown;
  };
  upstream.message = 200;
  upstream.extra = { scanned: false };

  const result = await replay(upstream).verifyQrcodestatus(
    verifyQrcodestatusExpired.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('extra', { scanned: false });
});

test('pl_count rejects a body without the return code', async () => {
  const upstream = structuredClone(plCount.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(replay(upstream).plCount(plCount.query), {
    module: 'pl_count',
    path: 'body.code',
    expected: 'present',
    actual: 'missing',
  });
});

test('pl_count schema rejects a string return code', () => {
  // 请求层 interpretResponse 会先把字符串 code 归一成数字，模块级只可能看到数字；这里直接校验结构定义。
  const validated = validateSync(PlCountBody, {
    ...plCount.response.body,
    code: '200',
  });
  expect(validated.issues).toHaveLength(1);
  expect(validated.issues?.[0]).toEqual({
    path: ['code'],
    message: 'Expected 200',
  });
});

test('pl_count drops a bad nested friend count and keeps the rest', async () => {
  const upstream = structuredClone(plCount.response.body) as {
    friend: { count: unknown; snsCount: unknown; celebrityCount: unknown };
  };
  upstream.friend.count = '0';

  const result = await replay(upstream).plCount(plCount.query);

  expect(result.body.friend as unknown).not.toHaveProperty('count');
  expect(result.body.friend as unknown).toHaveProperty('snsCount', 0);
  expect(result.body.friend as unknown).toHaveProperty('celebrityCount', 0);
});

test('pl_count drops bad loose counts and keeps undeclared fields', async () => {
  const upstream = structuredClone(plCount.response.body) as {
    notice: unknown;
    pushMsg: unknown;
    battle: unknown;
    friend: unknown;
    eventUser?: unknown;
    extra?: unknown;
  };
  upstream.notice = '0';
  upstream.pushMsg = 4;
  upstream.battle = 'battle';
  upstream.friend = null;
  delete upstream.eventUser;
  upstream.extra = { channel: 'web' };

  const result = await replay(upstream).plCount(plCount.query);

  expect(result.body as unknown).not.toHaveProperty('notice');
  expect(result.body as unknown).not.toHaveProperty('pushMsg');
  expect(result.body as unknown).not.toHaveProperty('battle');
  expect(result.body as unknown).toHaveProperty('friend', null);
  expect(result.body as unknown).not.toHaveProperty('eventUser');
  expect(result.body as unknown).toHaveProperty('extra', { channel: 'web' });
  expect(result.body as unknown).toHaveProperty('msg', 4);
});
