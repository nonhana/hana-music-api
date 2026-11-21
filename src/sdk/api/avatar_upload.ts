import type { ModuleInput } from '../../modules/avatar_upload.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/avatar_upload.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const avatarUpload: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'avatar_upload',
    route: '/avatar/upload',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as AvatarUploadInput } from '../../modules/avatar_upload.ts';
