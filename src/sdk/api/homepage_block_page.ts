import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/homepage_block_page.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/homepage_block_page.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const homepageBlockPage: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'homepage_block_page',
  route: '/homepage/block/page',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as HomepageBlockPageBody } from '../../modules/homepage_block_page.ts';
export type { ModuleInput as HomepageBlockPageInput } from '../../modules/homepage_block_page.ts';
