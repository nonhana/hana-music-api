import type { ModuleBody, ModuleInput } from '../../modules/sheet_preview.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/sheet_preview.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const sheetPreview: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'sheet_preview',
  route: '/sheet/preview',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SheetPreviewBody } from '../../modules/sheet_preview.ts';
export type { ModuleInput as SheetPreviewInput } from '../../modules/sheet_preview.ts';
