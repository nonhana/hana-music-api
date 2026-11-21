import type { ModuleBody, ModuleInput } from '../../modules/user_record.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/user_record.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const userRecord: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'user_record',
  route: '/user/record',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as UserRecordBody } from '../../modules/user_record.ts';
export type { ModuleInput as UserRecordInput } from '../../modules/user_record.ts';
