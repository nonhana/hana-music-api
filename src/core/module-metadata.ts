import type { ModuleEffect, ModuleRequestMetadata } from '../types/index.ts';
import { REQUEST_PROFILES } from './request-profile.ts';

/** 新模块默认使用 web profile；已有模块在迁移前仍按 legacy 行为处理。 */
export const LEGACY_MODULE_REQUEST_METADATA: ModuleRequestMetadata =
  Object.freeze({
    profile: 'legacy',
    checkToken: 'none',
  });

export const defineModule = <Input, Body>(
  metadata: Partial<ModuleRequestMetadata>,
  execute: ModuleEffect<Input, Body>,
): ModuleEffect<Input, Body> => {
  const profile = metadata.profile ?? 'web';
  const checkToken =
    metadata.checkToken ??
    (profile === 'legacy'
      ? LEGACY_MODULE_REQUEST_METADATA.checkToken
      : REQUEST_PROFILES[profile].checkToken);
  return Object.assign(execute, {
    request: Object.freeze({ profile, checkToken }),
  });
};
