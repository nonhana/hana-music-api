import type { ModuleInput } from '../../modules/yunbei_expense.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/yunbei_expense.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const yunbeiExpense: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'yunbei_expense',
    route: '/yunbei/expense',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as YunbeiExpenseInput } from '../../modules/yunbei_expense.ts';
