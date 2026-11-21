import type { ModuleInput } from '../../modules/musician_cloudbean_obtain.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_cloudbean_obtain.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianCloudbeanObtain: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'musician_cloudbean_obtain',
    route: '/musician/cloudbean/obtain',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as MusicianCloudbeanObtainInput } from '../../modules/musician_cloudbean_obtain.ts';
