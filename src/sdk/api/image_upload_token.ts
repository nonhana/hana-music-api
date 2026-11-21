import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/image_upload_token.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/image_upload_token.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const imageUploadToken: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'image_upload_token',
  route: '/image/upload/token',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ImageUploadTokenBody } from '../../modules/image_upload_token.ts';
export type { ModuleInput as ImageUploadTokenInput } from '../../modules/image_upload_token.ts';
