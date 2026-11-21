import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_room_check.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_room_check.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherRoomCheck: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_room_check',
  route: '/listentogether/room/check',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherRoomCheckBody } from '../../modules/listentogether_room_check.ts';
export type { ModuleInput as ListentogetherRoomCheckInput } from '../../modules/listentogether_room_check.ts';
