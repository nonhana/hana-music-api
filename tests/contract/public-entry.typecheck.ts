import { expectTypeOf } from 'bun:test';

import { Effect, Schema } from 'effect';

import {
  banner,
  createHanaMusicApi,
  generateDeviceId,
  innerVersion,
  invokeModule,
  playlistHot,
  search,
  songUrl,
} from '../../index.ts';
import type {
  CreateHanaMusicApiConfig,
  HanaMusicApiClient,
  ModuleCallConfig,
  ModuleInputOf,
  ModuleResponseOf,
  NcmApiResponse,
  RequestCrypto,
} from '../../index.ts';
import {
  invokeModule as invokeProgrammatic,
  loadProgrammaticApi,
} from '../../src/app/module-api.ts';
import { decodeModuleInput } from '../../src/core/module-input.ts';
import type { ModuleInput as SearchInput } from '../../src/modules/search.ts';
import type {
  ModuleDefinition,
  ModuleEffect,
} from '../../src/types/runtime.ts';
import type { UnknownJson } from '../../src/types/unknown.ts';

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
  await invokeProgrammatic('lyric', {
    id: '12',
    cookie: 'MUSIC_U=programmatic',
    crypto: 'api',
  });
  const programmatic = await loadProgrammaticApi();
  await programmatic.song_detail({
    ids: '12,34',
    cookie: 'MUSIC_U=programmatic',
    crypto: 'weapi',
  });
  const config: CreateHanaMusicApiConfig = {
    cookie: 'MUSIC_U=demo-cookie',
    deviceId: generateDeviceId(),
  };
  const api: HanaMusicApiClient = createHanaMusicApi(config);
  const moduleCallConfig: ModuleCallConfig = {
    crypto: 'weapi' satisfies RequestCrypto,
    deviceId: generateDeviceId(),
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
  // @ts-expect-error batch inputs have only API route keys
  await api.batch({ unrelated: 'value' });
  await search({
    keywords: '周杰伦',
  });
  // @ts-expect-error confirmed local input keeps required search keywords
  await search({});
  await songUrl({
    id: '1,2',
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
    id: '1,2',
    // @ts-expect-error query/config split forbids proxy in query
    proxy: 'http://localhost:8080',
  });

  // 局部定义没有 ModuleBody 的模块，避免依赖某个真实模块还没收窄。
  const unverifiedDefinition: ModuleDefinition<'unverified'> = {
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
