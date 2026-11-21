import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/listentogether_play_command.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/listentogether_play_command.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const listentogetherPlayCommand: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'listentogether_play_command',
  route: '/listentogether/play/command',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as ListentogetherPlayCommandBody } from '../../modules/listentogether_play_command.ts';
export type { ModuleInput as ListentogetherPlayCommandInput } from '../../modules/listentogether_play_command.ts';
