import type { Server } from 'bun'
import type { Hono } from 'hono'

import type { ModuleDefinition, ModuleRequest } from './runtime.ts'

export interface CreateServerOptions {
  readonly cacheEnabled?: boolean
  readonly cacheTtlMs?: number
  readonly corsAllowOrigin?: string
  readonly moduleDefinitions?: ModuleDefinition[]
  readonly modulesDirectory?: string
  readonly publicDirectory?: string
  readonly requestHandler?: ModuleRequest
  readonly serviceName?: string
  readonly serviceVersion?: string
}

export interface StartServerOptions extends CreateServerOptions {
  readonly hostname?: string
  readonly port?: number
  readonly silent?: boolean
}

export interface StartedServer {
  readonly app: Hono
  readonly server: Server<unknown>
  readonly url: URL
}

export interface CreateModuleApiOptions {
  readonly moduleDefinitions?: ModuleDefinition[]
  readonly modulesDirectory?: string
  readonly requestHandler?: ModuleRequest
}
