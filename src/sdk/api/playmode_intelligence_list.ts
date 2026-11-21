import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/playmode_intelligence_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/playmode_intelligence_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const playmodeIntelligenceList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'playmode_intelligence_list',
  route: '/playmode/intelligence/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as PlaymodeIntelligenceListBody } from '../../modules/playmode_intelligence_list.ts';
export type { ModuleInput as PlaymodeIntelligenceListInput } from '../../modules/playmode_intelligence_list.ts';
