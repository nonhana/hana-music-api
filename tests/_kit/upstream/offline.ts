import { getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import type { Dispatcher } from 'undici';

const origins = new Map<string, number>();
export const allowLoopback = (origin: string | URL) => {
  const url = new URL(origin);
  if (
    !['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname) ||
    !['http:', 'https:'].includes(url.protocol)
  )
    throw new Error('Only loopback origins can be registered');
  origins.set(url.origin, (origins.get(url.origin) ?? 0) + 1);
  let registered = true;
  return () => {
    if (!registered) return;
    registered = false;
    const remaining = (origins.get(url.origin) ?? 1) - 1;
    if (remaining) origins.set(url.origin, remaining);
    else origins.delete(url.origin);
  };
};

export const installOfflineGuard = () => {
  const native = globalThis.fetch;
  const dispatcher = getGlobalDispatcher();
  const rejected: Array<string> = [];
  const check = (url: string | URL) => {
    const target = new URL(url);
    if (!origins.has(target.origin)) {
      rejected.push(target.origin);
      throw new Error(`Offline guard rejected ${target.origin}`);
    }
  };
  const guarded = Object.assign(
    async (input: Request | URL | string, init?: RequestInit) => {
      check(input instanceof Request ? input.url : input);
      const proxy: unknown = init && Reflect.get(init, 'proxy');
      if (typeof proxy === 'string') check(proxy);
      const redirect =
        init?.redirect ??
        (input instanceof Request ? input.redirect : 'follow');
      const response = await native(input, {
        ...init,
        redirect: redirect === 'follow' ? 'manual' : redirect,
      });
      if (
        redirect === 'follow' &&
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.has('Location')
      ) {
        const next = new URL(
          response.headers.get('Location')!,
          response.url ||
            (input instanceof Request ? input.url : String(input)),
        );
        rejected.push(next.origin);
        await response.body?.cancel();
        throw new Error(
          'Offline guard refuses automatic redirects; use an explicit manual transport boundary',
        );
      }
      return response;
    },
    {
      preconnect: () => {
        throw new Error('Offline guard rejected preconnect');
      },
    },
  );
  globalThis.fetch = guarded;
  const proxy = new Proxy(dispatcher, {
    get(target, property) {
      if (property === 'dispatch')
        return (
          options: Dispatcher.DispatchOptions,
          handler: Dispatcher.DispatchHandler,
        ) => {
          check(String(options.origin));
          return target.dispatch(options, handler);
        };
      const value: unknown = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  setGlobalDispatcher(proxy);
  return {
    rejected,
    verify: () => {
      if (rejected.length)
        throw new Error(`Unexpected native network: ${rejected.join(', ')}`);
    },
    dispose: () => {
      globalThis.fetch = native;
      setGlobalDispatcher(dispatcher);
    },
  };
};
