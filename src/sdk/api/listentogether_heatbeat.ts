import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_heatbeat.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_heatbeat.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherHeatbeat: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_heatbeat',
  route: '/listentogether/heatbeat',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherHeatbeatBody } from '../../modules/listentogether_heatbeat.ts';
export type { ModuleInput as ListentogetherHeatbeatInput } from '../../modules/listentogether_heatbeat.ts';
