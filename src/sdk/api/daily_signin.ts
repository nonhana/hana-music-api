import type { ModuleInput } from '../../modules/daily_signin.ts';
import moduleEffect, {
  decodeModuleInput,
  moduleActions,
} from '../../modules/daily_signin.ts';
import type { SdkModuleInvokerFor } from '../../types/sdk.ts';
import { createStandaloneModuleInvoker } from '../invoker.ts';

export const dailySignin: SdkModuleInvokerFor<ModuleInput> =
  /* @__PURE__ */ createStandaloneModuleInvoker<ModuleInput>({
    identifier: 'daily_signin',
    route: '/daily_signin',
    execute: moduleEffect,
    decodeInput: decodeModuleInput,
    actions: moduleActions,
  });

export type { ModuleInput as DailySigninInput } from '../../modules/daily_signin.ts';
