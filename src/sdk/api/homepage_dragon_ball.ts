import type {
  ModuleBody,
  ModuleInput,
} from '../../modules/homepage_dragon_ball.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/homepage_dragon_ball.ts';
import type { ModuleResponse } from '../../types/runtime.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const homepageDragonBall: SdkModuleInvokerFor<
  ModuleInput,
  ModuleResponse<ModuleBody>
> = /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput, ModuleBody>({
  identifier: 'homepage_dragon_ball',
  route: '/homepage/dragon/ball',
  execute: moduleEffect,
  decodeInput: decodeModuleInput,
  actions: moduleActions,
});

export { ModuleBody as HomepageDragonBallBody } from '../../modules/homepage_dragon_ball.ts';
export type { ModuleInput as HomepageDragonBallInput } from '../../modules/homepage_dragon_ball.ts';
