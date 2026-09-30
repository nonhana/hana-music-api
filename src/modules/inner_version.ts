import { Effect } from 'effect';

import { SERVICE_VERSION } from '../core/service-metadata.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const innerVersion: ModuleEffect<ModuleInput> = () =>
  Effect.succeed({
    status: 200,
    cookie: [],
    body: { code: 200, data: { version: SERVICE_VERSION } },
  });

export default innerVersion;
export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
