import type { ModuleBody, ModuleInput } from '../../modules/lyric.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/lyric.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const lyric: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'lyric',
  route: '/lyric',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LyricBody } from '../../modules/lyric.ts';
export type { ModuleInput as LyricInput } from '../../modules/lyric.ts';
