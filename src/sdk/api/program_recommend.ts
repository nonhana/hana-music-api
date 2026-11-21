import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/program_recommend.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/program_recommend.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const programRecommend: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'program_recommend',
  route: '/program/recommend',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ProgramRecommendBody } from '../../modules/program_recommend.ts';
export type { ModuleInput as ProgramRecommendInput } from '../../modules/program_recommend.ts';
