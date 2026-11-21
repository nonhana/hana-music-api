import type { ModuleBody, ModuleInput } from '../../modules/dj_banner.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/dj_banner.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const djBanner: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'dj_banner',
  route: '/dj/banner',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as DjBannerBody } from '../../modules/dj_banner.ts';
export type { ModuleInput as DjBannerInput } from '../../modules/dj_banner.ts';
