import type { ModuleBody, ModuleInput } from '../../modules/mlog_music_rcmd.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/mlog_music_rcmd.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const mlogMusicRcmd: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'mlog_music_rcmd',
  route: '/mlog/music/rcmd',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as MlogMusicRcmdBody } from '../../modules/mlog_music_rcmd.ts';
export type { ModuleInput as MlogMusicRcmdInput } from '../../modules/mlog_music_rcmd.ts';
