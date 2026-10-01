import { buildCallServices } from '../../src/core/call.ts';
import type { CreateHanaMusicApiConfig } from '../../src/types/index.ts';

export const clientLayer = (
  config?: CreateHanaMusicApiConfig,
  initializeAnonymous = true,
) => buildCallServices(undefined, config ?? {}, initializeAnonymous);
