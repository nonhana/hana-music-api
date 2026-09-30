import type { GeneratedModuleContractMap } from './generated/module-surface.generated.ts';
import type { ModuleQuery, ModuleResponse, NcmApiResponse } from './runtime.ts';

export interface ModuleContractDefinition<
  TQuery extends ModuleQuery = ModuleQuery,
  TResponse extends ModuleResponse = ModuleResponse,
> {
  query: TQuery;
  response: TResponse;
}

export type ModuleContractMap = GeneratedModuleContractMap;
export type ModuleIdentifier = keyof ModuleContractMap;
export type ModuleInputOf<K extends ModuleIdentifier> =
  ModuleContractMap[K]['input'];
export type ModuleQueryOf<K extends ModuleIdentifier> = ModuleInputOf<K>;
export type ModuleResponseOf<K extends ModuleIdentifier> =
  ModuleContractMap[K]['response'];

export type ProgrammaticModuleInvoker<
  TQuery extends ModuleQuery = ModuleQuery,
  TResponse extends NcmApiResponse = NcmApiResponse,
> = (query?: TQuery & ModuleQuery) => Promise<TResponse>;

export type ProgrammaticApi<TContractMap extends object = ModuleContractMap> = {
  [K in keyof TContractMap]: TContractMap[K] extends ModuleContractDefinition
    ? ProgrammaticModuleInvoker<
        TContractMap[K]['query'],
        TContractMap[K]['response']
      >
    : never;
};

export type DynamicProgrammaticApi = Record<string, ProgrammaticModuleInvoker>;
