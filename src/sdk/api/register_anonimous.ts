import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/register_anonimous.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/register_anonimous.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const registerAnonimous: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'register_anonimous',
  route: '/register/anonimous',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as RegisterAnonimousBody } from '../../modules/register_anonimous.ts';
export type { ModuleInput as RegisterAnonimousInput } from '../../modules/register_anonimous.ts';
