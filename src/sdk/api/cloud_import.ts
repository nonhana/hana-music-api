import type { ModuleInput } from '../../modules/cloud_import.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/cloud_import.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const cloudImport: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'cloud_import',
    route: '/cloud/import',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as CloudImportInput } from '../../modules/cloud_import.ts';
