import type { ModuleBody, ModuleInput } from '../../modules/check_music.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/check_music.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const checkMusic: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'check_music',
  route: '/check/music',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CheckMusicBody } from '../../modules/check_music.ts';
export type { ModuleInput as CheckMusicInput } from '../../modules/check_music.ts';
