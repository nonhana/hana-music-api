import type { ModuleBody, ModuleInput } from '../../modules/comment_album.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/comment_album.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const commentAlbum: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'comment_album',
  route: '/comment/album',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as CommentAlbumBody } from '../../modules/comment_album.ts';
export type { ModuleInput as CommentAlbumInput } from '../../modules/comment_album.ts';
