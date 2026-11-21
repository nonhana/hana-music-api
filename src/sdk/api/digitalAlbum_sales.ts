import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/digitalAlbum_sales.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/digitalAlbum_sales.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const digitalAlbumSales: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'digitalAlbum_sales',
  route: '/digitalAlbum/sales',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DigitalAlbumSalesBody } from '../../modules/digitalAlbum_sales.ts';
export type { ModuleInput as DigitalAlbumSalesInput } from '../../modules/digitalAlbum_sales.ts';
