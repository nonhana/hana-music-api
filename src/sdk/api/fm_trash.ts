import type { ModuleBody, ModuleInput } from '../../modules/fm_trash.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/fm_trash.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const fmTrash: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'fm_trash',
  route: '/fm_trash',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as FmTrashBody } from '../../modules/fm_trash.ts';
export type { ModuleInput as FmTrashInput } from '../../modules/fm_trash.ts';
