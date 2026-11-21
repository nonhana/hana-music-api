import type { ModuleBody, ModuleInput } from '../../modules/cloud_match.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/cloud_match.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const cloudMatch: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'cloud_match',
  route: '/cloud/match',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CloudMatchBody } from '../../modules/cloud_match.ts';
export type { ModuleInput as CloudMatchInput } from '../../modules/cloud_match.ts';
