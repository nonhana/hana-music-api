import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/musician_data_overview.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_data_overview.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianDataOverview: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'musician_data_overview',
  route: '/musician/data/overview',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MusicianDataOverviewBody } from '../../modules/musician_data_overview.ts';
export type { ModuleInput as MusicianDataOverviewInput } from '../../modules/musician_data_overview.ts';
