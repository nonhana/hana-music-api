import type { Server } from 'bun';
import type { Hono } from 'hono';

import type { ModuleDefinition, RequestCapability } from './runtime.ts';

export interface CreateServerOptions {
  readonly cacheEnabled?: boolean;
  readonly cacheTtlMs?: number;
  readonly corsAllowOrigin?: string;
  readonly docsDistDirectory?: string;
  readonly debugApiRequests?: boolean;
  readonly hostname?: string;
  readonly moduleDefinitions?: Array<ModuleDefinition>;
  readonly modulesDirectory?: string;
  readonly requestHandler?: RequestCapability;
  readonly connectionIp?: (request: Request) => string | undefined;
  readonly bodyTimeoutMs?: number;
  readonly maxBodyBytes?: number;
  readonly serviceName?: string;
  readonly serviceVersion?: string;
  readonly traffic?: TrafficOptions;
}

export interface TrafficOptions {
  readonly burst?: number;
  readonly maxInFlight?: number;
  readonly maxUploads?: number;
  readonly requestsPerSecond?: number;
  readonly trustedProxyIps?: ReadonlyArray<string>;
}

export interface StartServerOptions extends CreateServerOptions {
  readonly port?: number;
  readonly silent?: boolean;
}

export interface StartedServer {
  readonly app: Hono;
  readonly server: Server<unknown>;
  readonly url: URL;
}

export interface CreateModuleApiOptions {
  readonly moduleDefinitions?: Array<ModuleDefinition>;
  readonly modulesDirectory?: string;
  readonly requestHandler?: RequestCapability;
}
