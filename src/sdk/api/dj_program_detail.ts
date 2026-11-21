import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/dj_program_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_program_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djProgramDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_program_detail',
  route: '/dj/program/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjProgramDetailBody } from '../../modules/dj_program_detail.ts';
export type { ModuleInput as DjProgramDetailInput } from '../../modules/dj_program_detail.ts';
