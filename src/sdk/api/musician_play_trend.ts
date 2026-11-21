import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/musician_play_trend.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_play_trend.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianPlayTrend: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'musician_play_trend',
  route: '/musician/play/trend',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MusicianPlayTrendBody } from '../../modules/musician_play_trend.ts';
export type { ModuleInput as MusicianPlayTrendInput } from '../../modules/musician_play_trend.ts';
