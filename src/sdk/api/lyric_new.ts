import type { ModuleBody, ModuleInput } from '../../modules/lyric_new.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/lyric_new.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const lyricNew: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'lyric_new',
  route: '/lyric/new',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as LyricNewBody } from '../../modules/lyric_new.ts';
export type { ModuleInput as LyricNewInput } from '../../modules/lyric_new.ts';
