import { setRuntimeState } from '../core/runtime.ts';
import { createServer } from '../server/create-server.ts';
import type {
  GenerateConfigOptions,
  StartedServer,
  StartServerOptions,
} from '../types/index.ts';
import { generateConfig, readAnonymousToken } from './generate-config.ts';

const DEFAULT_PORT = 3021;
const DEFAULT_HOSTNAME = '0.0.0.0';

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? fallback : parsed;
};

const resolveAnonymousTokenFilePath = (
  options: GenerateConfigOptions,
): string | undefined => options.tokenFilePath ?? Bun.env.ANONYMOUS_TOKEN_FILE;

const resolveStartServerOptions = (
  options: StartServerOptions = {},
): Required<Pick<StartServerOptions, 'hostname' | 'port' | 'silent'>> &
  StartServerOptions => ({
  ...options,
  hostname: options.hostname ?? Bun.env.HOST ?? DEFAULT_HOSTNAME,
  port: options.port ?? parsePort(Bun.env.PORT, DEFAULT_PORT),
  silent: options.silent ?? false,
});

export const startServer = async (
  options: StartServerOptions = {},
): Promise<StartedServer> => {
  const resolvedOptions = resolveStartServerOptions(options);
  if (
    resolvedOptions.debugApiRequests &&
    !['127.0.0.1', 'localhost', '::1'].includes(resolvedOptions.hostname)
  ) {
    throw new Error('debugApiRequests requires a loopback hostname');
  }
  const servers = new WeakMap<Request, ReturnType<typeof Bun.serve>>();
  const app = await createServer(
    {
      ...resolvedOptions,
      connectionIp: (request) =>
        servers.get(request)?.requestIP(request)?.address,
    },
    { allowDebugApiRequests: true },
  );
  const server = Bun.serve({
    fetch: (request, currentServer) => {
      servers.set(request, currentServer);
      return app.fetch(request);
    },
    hostname: resolvedOptions.hostname,
    port: resolvedOptions.port,
  });
  const exposedHostname =
    resolvedOptions.hostname === '0.0.0.0'
      ? '127.0.0.1'
      : resolvedOptions.hostname;
  const url = new URL(`http://${exposedHostname}:${server.port}`);

  if (!resolvedOptions.silent) {
    console.info(`[hana-music-api] listening on ${url.toString()}`);
  }

  return {
    app,
    server,
    url,
  };
};

export const ensureAnonymousToken = async (
  options: GenerateConfigOptions = {},
): Promise<string> => {
  const tokenFilePath = resolveAnonymousTokenFilePath(options);
  const token = readAnonymousToken(tokenFilePath);
  if (token) {
    setRuntimeState({
      anonymousToken: token,
    });

    return token;
  }

  return generateConfig({
    ...options,
    tokenFilePath,
  });
};

if (import.meta.main) {
  await ensureAnonymousToken();
  const startedServer = await startServer();
  let isStopping = false;
  const stopServerAndExit = async () => {
    if (isStopping) {
      return;
    }

    isStopping = true;
    try {
      await startedServer.server.stop();
    } finally {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => {
    void stopServerAndExit();
  });
  process.once('SIGTERM', () => {
    void stopServerAndExit();
  });
}
