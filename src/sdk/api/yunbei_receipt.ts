import type { ModuleInput } from '../../modules/yunbei_receipt.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_receipt.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiReceipt: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'yunbei_receipt',
    route: '/yunbei/receipt',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as YunbeiReceiptInput } from '../../modules/yunbei_receipt.ts';
