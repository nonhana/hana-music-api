import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_program_toplist.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_program_toplist.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djProgramToplist: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_program_toplist',
  route: '/dj/program/toplist',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjProgramToplistBody } from '../../modules/dj_program_toplist.ts';
export type { ModuleInput as DjProgramToplistInput } from '../../modules/dj_program_toplist.ts';
