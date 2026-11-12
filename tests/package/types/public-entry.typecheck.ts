import { expectTypeOf } from 'bun:test';

import { Effect, Schema } from 'effect';

import {
  albumSub,
  artistSub,
  banner,
  // @ts-expect-error Internal assembly must not become a root export.
  createClientFromContext,
  createHanaMusicApi,
  createRequest,
  generateDeviceId,
  getNcmFailureInfo,
  innerVersion,
  invokeModule,
  isNcmApiResponse,
  playlistHot,
  playlistTagsUpdate,
  playlistTracks,
  search,
  songDetail,
  songUrl,
} from '../../../index.ts';
import type {
  CreateHanaMusicApiConfig,
  CreateRequestOptions,
  HanaMusicApiClient,
  // @ts-expect-error Execution dependencies stay behind the public config boundary.
  InternalExecution,
  ModuleCallConfig,
  ModuleInputOf,
  ModuleResponseOf,
  NcmApiFailure,
  NcmApiResponse,
  NcmFailureInfo,
} from '../../../index.ts';
import {
  invokeModule as invokeProgrammatic,
  loadProgrammaticApi,
} from '../../../src/app/module-api.ts';
import { decodeModuleInput } from '../../../src/core/module-input.ts';
import type { ModuleInput as SearchInput } from '../../../src/modules/search.ts';
import type {
  ModuleDefinition,
  ModuleEffect,
} from '../../../src/types/runtime.ts';
import type { UnknownJson } from '../../../src/types/unknown.ts';

// @ts-expect-error The server project must not acquire browser document globals.
void document;
// @ts-expect-error The server project must not acquire browser window globals.
void window;

const localInputMatches: ModuleInputOf<'search'> extends SearchInput
  ? true
  : never = true;
const localInputHasNoExecutionKeys: Extract<
  keyof ModuleCallConfig,
  keyof SearchInput
> extends never
  ? true
  : never = true;
const localInputHasNoIndexSignature: string extends keyof SearchInput
  ? never
  : true = true;
void localInputHasNoExecutionKeys;
void localInputHasNoIndexSignature;
const definition: ModuleDefinition<'example', { id: string }> = {
  actions: {},
  identifier: 'example',
  route: '/example',
  decodeInput: (input) =>
    decodeModuleInput(Schema.Struct({ id: Schema.String }), input),
  execute: (input) =>
    Effect.succeed({ status: 200, cookie: [], body: input.id }),
};
const implementation: ModuleEffect<{ id: string }> = definition.execute;
// @ts-expect-error a Promise default cannot satisfy the Effect execution contract
const promiseImplementation: ModuleEffect<{ id: string }> = async (input) => ({
  status: 200,
  cookie: [],
  body: input.id,
});
void localInputMatches;
void implementation;
void promiseImplementation;

const assertPublicEntrySurface = async () => {
  await invokeProgrammatic(
    'lyric',
    { id: '12' },
    {},
    { cookie: 'MUSIC_U=programmatic' },
  );
  const programmatic = await loadProgrammaticApi();
  await programmatic.song_detail(
    { ids: [12, 34] },
    { cookie: 'MUSIC_U=programmatic' },
  );
  const config: CreateHanaMusicApiConfig = {
    cookie: 'MUSIC_U=demo-cookie',
    state: { deviceId: generateDeviceId() },
  };
  const api: HanaMusicApiClient = createHanaMusicApi(config);
  const moduleCallConfig: ModuleCallConfig = {
    state: { deviceId: generateDeviceId() },
  };

  await api.login({ email: 'demo@example.com', password: 'password' });
  await api.login({ email: 'demo@example.com', md5_password: 'digest' });
  // @ts-expect-error login requires one credential branch
  await api.login({ email: 'demo@example.com' });
  await api.loginCellphone({ phone: '123', captcha: '456' });
  await api.loginCellphone({ phone: '123', password: 'password' });
  await api.loginCellphone({ phone: '123', md5_password: 'digest' });
  // @ts-expect-error cellphone login requires captcha or a password credential
  await api.loginCellphone({ phone: '123' });
  await api.playlistCoverUpdate({ id: '123' });
  await api.batch({ '/api/example': { id: '123' } });
  await songDetail({ ids: [12] });
  await playlistTracks({ op: 'add', pid: 1, tracks: [2] });
  await playlistTagsUpdate({ id: 1, tags: ['rock'] });
  await api.songDetail({ ids: [12, '34'] });
  // @ts-expect-error legacy comma strings are not accepted
  await api.songDetail({ ids: '12,34' });
  // @ts-expect-error undeclared input fields are rejected
  await api.songDetail({ ids: [12], extra: true });
  await api.playlistTracks({ op: 'add', pid: 1, tracks: [2] });
  // @ts-expect-error track ids must be an array
  await api.playlistTracks({ op: 'add', pid: 1, tracks: '2' });
  await api.playlistTagsUpdate({ id: 1, tags: ['rock'] });
  // @ts-expect-error tags must be an array
  await api.playlistTagsUpdate({ id: 1, tags: 'rock;pop' });
  await search({
    keywords: '周杰伦',
  });
  // @ts-expect-error confirmed local input keeps required search keywords
  await search({});
  await songUrl({
    ids: [1, 2],
  });
  await banner();
  await innerVersion();
  await playlistHot();

  await search({
    keywords: '周杰伦',
    // @ts-expect-error query/config split forbids cookie in query
    cookie: 'MUSIC_U=forbidden',
  });

  await songUrl({
    ids: [1, 2],
    // @ts-expect-error query/config split forbids proxy in query
    proxy: 'http://localhost:8080',
  });

  // 局部定义没有 ModuleBody 的模块，避免依赖某个真实模块还没收窄。
  const unverifiedDefinition: ModuleDefinition<'unverified'> = {
    actions: {},
    identifier: 'unverified',
    route: '/unverified',
    decodeInput: (input) => decodeModuleInput(Schema.Struct({}), input),
    execute: (input) =>
      Effect.succeed({ status: 200, cookie: [], body: input as UnknownJson }),
  };
  type UnverifiedResponse = Effect.Success<
    ReturnType<typeof unverifiedDefinition.execute>
  >;
  const fallbackResponse = {} as UnverifiedResponse;
  const conservativeResponse: NcmApiResponse = fallbackResponse;
  const jsonBody: UnknownJson = fallbackResponse.body;
  // @ts-expect-error unverified responses cannot expose fields without narrowing
  void fallbackResponse.body.songs;
  void jsonBody;
  void conservativeResponse;
  void unverifiedDefinition;

  // 公开类型表里仍未收窄的 batch：body 必须仍是 UnknownJson，不能直接取字段。
  expectTypeOf<
    ModuleResponseOf<'batch'>['body']
  >().toEqualTypeOf<UnknownJson>();
  const publicFallbackResponse = {} as ModuleResponseOf<'batch'>;
  const publicFallbackBody: UnknownJson = publicFallbackResponse.body;
  // @ts-expect-error unverified module responses cannot expose fields without narrowing
  void publicFallbackResponse.body.songs;
  void publicFallbackBody;

  // @ts-expect-error unknown module identifier must not compile
  await invokeModule('not_a_real_module', {}, moduleCallConfig);

  // @ts-expect-error unknown API property must not compile
  await api.notARealModule({});
};

void assertPublicEntrySurface;

void (undefined as unknown as InternalExecution);
void createClientFromContext;

const optionalTokenProvider = async () => 'fresh-token';

const assertOptionalCheckToken = async () => {
  const client = createHanaMusicApi({ checkToken: optionalTokenProvider });
  await client.albumSub({ id: 1, t: 1 }, { checkToken: 'token' });
  await artistSub({ id: 1, t: 0 }, { checkToken: optionalTokenProvider });
  await invokeModule(
    'search',
    { keywords: 'token' },
    { checkToken: optionalTokenProvider },
  );
  await albumSub({ id: 1, t: 0 });
  // @ts-expect-error checkToken belongs in config rather than business input.
  await albumSub({ id: 1, t: 1, checkToken: 'query-token' });
  // @ts-expect-error providers must return Promise<string>.
  await artistSub({ id: 1, t: 1 }, { checkToken: async () => 42 });
  // @ts-expect-error checkToken does not accept booleans.
  await client.search({ keywords: 'invalid' }, { checkToken: true });
};
void assertOptionalCheckToken;

const assertNarrowModuleConfig = async () => {
  // @ts-expect-error Ordinary modules cannot choose a protocol.
  await search({ keywords: 'x' }, { crypto: 'api' });
  // @ts-expect-error Ordinary modules cannot choose a UA.
  await search({ keywords: 'x' }, { ua: 'old' });
  // @ts-expect-error Ordinary modules cannot choose a domain.
  await search({ keywords: 'x' }, { domain: 'https://music.163.com' });
  // @ts-expect-error Ordinary modules cannot choose encrypted responses.
  await search({ keywords: 'x' }, { e_r: true });
  // @ts-expect-error Ordinary modules cannot choose protocol compression.
  await search({ keywords: 'x' }, { acceptGzip: true });
  // @ts-expect-error Arbitrary headers are a low-level option.
  await search({ keywords: 'x' }, { headers: {} });
  // @ts-expect-error The old device alias has been removed.
  await search({ keywords: 'x' }, { deviceId: 'old' });
  await search(
    { keywords: 'x' },
    { state: { deviceId: 'new' }, checkToken: async () => 'fresh' },
  );
};
void assertNarrowModuleConfig;

const rawOptions: CreateRequestOptions = {
  crypto: 'linuxapi',
  ua: 'raw',
  domain: 'https://music.163.com',
  headers: { 'X-Raw': 'value' },
  e_r: false,
  acceptGzip: true,
};
const assertRawOptions = () => createRequest('/api/probe', {}, rawOptions);
void assertRawOptions;

const describeFailure = (failure: NcmFailureInfo): string => {
  switch (failure.kind) {
    case 'business':
      return String(failure.code);
    case 'rateLimited':
      return String(failure.retryAfter);
    case 'upstreamShape':
      return failure.path;
    case 'timeout':
    case 'cancelled':
    case 'invalidRequest':
    case 'transport':
    case 'unknown':
      return failure.kind;
    default: {
      const exhaustive: never = failure;
      return exhaustive;
    }
  }
};

const failureInfo: NcmFailureInfo = {
  kind: 'business',
  code: 301,
  message: '需要登录',
};
const failureResponse: NcmApiFailure = {
  status: 301,
  cookie: [],
  body: { code: 301 },
  failure: failureInfo,
};
const widenedFailure: NcmApiResponse = failureResponse;
expectTypeOf(isNcmApiResponse(failureResponse)).toEqualTypeOf<boolean>();
const readFailure = getNcmFailureInfo(failureResponse);
if (readFailure?.kind === 'business') {
  expectTypeOf(readFailure.code).toEqualTypeOf<number | null>();
}
const successWithFailure: NcmApiResponse = {
  status: 200,
  cookie: [],
  body: {},
  // @ts-expect-error success envelopes do not declare a failure field
  failure: failureInfo,
};
// @ts-expect-error unknown failure kinds are not part of the union
const unknownKind: NcmFailureInfo = { kind: 'serverError' };
// @ts-expect-error business metadata needs an explicit serializable code
const missingBusinessCode: NcmFailureInfo = { kind: 'business' };
void describeFailure;
void widenedFailure;
void successWithFailure;
void unknownKind;
void missingBusinessCode;
