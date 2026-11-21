import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listen_data_today_song.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listen_data_today_song.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listenDataTodaySong: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listen_data_today_song',
  route: '/listen/data/today/song',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListenDataTodaySongBody } from '../../modules/listen_data_today_song.ts';
export type { ModuleInput as ListenDataTodaySongInput } from '../../modules/listen_data_today_song.ts';
