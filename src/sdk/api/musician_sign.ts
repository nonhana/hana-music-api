import type { ModuleInput } from '../../modules/musician_sign.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/musician_sign.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const musicianSign: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'musician_sign',
    route: '/musician/sign',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as MusicianSignInput } from '../../modules/musician_sign.ts';
