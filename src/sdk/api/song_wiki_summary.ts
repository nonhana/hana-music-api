import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/song_wiki_summary.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/song_wiki_summary.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const songWikiSummary: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'song_wiki_summary',
  route: '/song/wiki/summary',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as SongWikiSummaryBody } from '../../modules/song_wiki_summary.ts';
export type { ModuleInput as SongWikiSummaryInput } from '../../modules/song_wiki_summary.ts';
