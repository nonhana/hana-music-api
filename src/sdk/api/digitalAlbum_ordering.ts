import type { ModuleInput } from '../../modules/digitalAlbum_ordering.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/digitalAlbum_ordering.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const digitalAlbumOrdering: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'digitalAlbum_ordering',
    route: '/digitalAlbum/ordering',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as DigitalAlbumOrderingInput } from '../../modules/digitalAlbum_ordering.ts';
