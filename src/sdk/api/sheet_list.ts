import type { ModuleBody, ModuleInput } from '../../modules/sheet_list.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/sheet_list.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const sheetList: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'sheet_list',
  route: '/sheet/list',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SheetListBody } from '../../modules/sheet_list.ts';
export type { ModuleInput as SheetListInput } from '../../modules/sheet_list.ts';
