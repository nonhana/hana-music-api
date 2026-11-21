import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/digitalAlbum_detail.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/digitalAlbum_detail.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const digitalAlbumDetail: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'digitalAlbum_detail',
  route: '/digitalAlbum/detail',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DigitalAlbumDetailBody } from '../../modules/digitalAlbum_detail.ts';
export type { ModuleInput as DigitalAlbumDetailInput } from '../../modules/digitalAlbum_detail.ts';
