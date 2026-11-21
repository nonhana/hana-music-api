import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_monthdownlist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_monthdownlist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songMonthdownlist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_monthdownlist',
  route: '/song/monthdownlist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongMonthdownlistBody } from '../../modules/song_monthdownlist.ts';
export type { ModuleInput as SongMonthdownlistInput } from '../../modules/song_monthdownlist.ts';
