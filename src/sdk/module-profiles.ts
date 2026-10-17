import { LEGACY_MODULE_REQUEST_METADATA } from '../core/module-metadata.ts';
import type {
  ModuleIdentifier,
  ModuleRequestMetadata,
} from '../types/index.ts';
import { sdkModuleRegistry } from './generated/registry.generated.ts';

/**
 * 可枚举的模块请求元数据。未迁移模块明确标为 legacy，
 * 而不是让调用方从模块内部的 crypto/UA 覆盖推断请求形态。
 */
export const moduleRequestProfiles: Readonly<
  Record<ModuleIdentifier, ModuleRequestMetadata>
> = Object.fromEntries(
  Object.entries(sdkModuleRegistry).map(([identifier, definition]) => [
    identifier,
    definition.execute.request ?? LEGACY_MODULE_REQUEST_METADATA,
  ]),
) as Readonly<Record<ModuleIdentifier, ModuleRequestMetadata>>;
