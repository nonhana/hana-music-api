import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_room_create.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_room_create.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherRoomCreate: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_room_create',
  route: '/listentogether/room/create',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherRoomCreateBody } from '../../modules/listentogether_room_create.ts';
export type { ModuleInput as ListentogetherRoomCreateInput } from '../../modules/listentogether_room_create.ts';
