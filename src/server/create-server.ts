import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { createProcessLayer, createServiceLayer } from '../core/call.ts';
import type { CreateServerOptions } from '../types/index.ts';
import { AdmissionController } from './admission.ts';
import { registerDemoRoutes } from './demo-routes.tsx';
import { registerDocsRoutes } from './docs-routes.ts';
import { loadModuleDefinitions } from './module-loader.ts';
import { registerBaseRoutes, registerModuleRoutes } from './routes.ts';

export interface CreateServerRuntimeOptions {
  readonly allowDebugApiRequests?: boolean;
}

/** 创建 Hono 服务实例 */
export const createServer = async (
  options: CreateServerOptions = {},
  runtimeOptions: CreateServerRuntimeOptions = {},
): Promise<Hono> => {
  if (
    options.debugApiRequests &&
    !['127.0.0.1', 'localhost', '::1'].includes(options.hostname ?? '')
  ) {
    throw new Error('debugApiRequests requires a loopback hostname');
  }
  if (options.debugApiRequests && !runtimeOptions.allowDebugApiRequests) {
    throw new Error('debugApiRequests is only available through startServer');
  }
  const app = new Hono();
  const modulesDirectory =
    options.modulesDirectory ??
    resolve(dirname(fileURLToPath(import.meta.url)), '../modules');
  const moduleDefinitions =
    options.moduleDefinitions ??
    (await loadModuleDefinitions(modulesDirectory));
  const modules = createServiceLayer(
    createProcessLayer(),
    options.cacheEnabled === false ? null : (options.cacheTtlMs ?? 120_000),
  );
  const requestHandler = options.requestHandler;
  const admission = new AdmissionController(options.traffic);

  app.use('*', createCorsMiddleware(options));

  registerBaseRoutes(app, options);
  registerDocsRoutes(app, {
    docsDistDirectory: options.docsDistDirectory,
    serviceName: options.serviceName ?? 'hana-music-api',
  });
  registerModuleRoutes(app, moduleDefinitions, {
    modules,
    admission,
    serverOptions: options,
    requestHandler,
  });
  registerDemoRoutes(app, {
    admission,
    serverOptions: options,
    modules,
    requestHandler,
  });

  return app;
};

const createCorsMiddleware = (options: CreateServerOptions) => {
  return cors({
    allowHeaders: ['X-Requested-With', 'Content-Type'],
    allowMethods: ['PUT', 'POST', 'GET', 'DELETE', 'OPTIONS'],
    credentials: true,
    origin: (origin) => {
      return options.corsAllowOrigin ?? origin ?? '*';
    },
  });
};
