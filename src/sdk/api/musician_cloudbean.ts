import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/musician_cloudbean.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_cloudbean.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianCloudbean: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'musician_cloudbean',
  route: '/musician/cloudbean',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MusicianCloudbeanBody } from '../../modules/musician_cloudbean.ts';
export type { ModuleInput as MusicianCloudbeanInput } from '../../modules/musician_cloudbean.ts';
