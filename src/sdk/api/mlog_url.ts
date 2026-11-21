import type { ModuleBody, ModuleInput } from '../../modules/mlog_url.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mlog_url.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mlogUrl: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mlog_url',
  route: '/mlog/url',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MlogUrlBody } from '../../modules/mlog_url.ts';
export type { ModuleInput as MlogUrlInput } from '../../modules/mlog_url.ts';
