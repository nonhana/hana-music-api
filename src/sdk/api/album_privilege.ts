import type { ModuleBody, ModuleInput } from '../../modules/album_privilege.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/album_privilege.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const albumPrivilege: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'album_privilege',
  route: '/album/privilege',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as AlbumPrivilegeBody } from '../../modules/album_privilege.ts';
export type { ModuleInput as AlbumPrivilegeInput } from '../../modules/album_privilege.ts';
