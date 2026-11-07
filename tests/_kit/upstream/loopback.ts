import type { FetchLike } from '../../../src/types/index.ts';
import { allowLoopback } from './offline.ts';
import { withScenario } from './scenario.ts';
import { readWireRequest } from './wire.ts';

export type FakeMode = 'healthy' | 'http429' | 'plain429' | 'slow-body';

const success = () =>
  Response.json({
    code: 200,
    result: { songs: [] },
    data: [],
    lrc: { lyric: 'local' },
  });

export const createFakeUpstream = (delayMs = 50) => {
  let mode: FakeMode = 'healthy';
  let active = 0;
  let peak = 0;
  let calls = 0;
  let cancelled = 0;
  const paths: Record<string, number> = {};
  const writes: Array<string> = [];
  const sent: Array<{ logical: string; socket: string; method: string }> = [];
  const failures: Array<Error> = [];
  const routes = [
    {
      url: 'https://interface.music.163.com/api/search/get',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://interface.music.163.com/api/radio/like',
      method: 'POST',
      response: () => Response.json({ code: 200, playlistId: 1, songs: [] }),
    },
    { url: 'https://music.163.com/raw/page', method: 'GET', response: success },
    {
      url: 'https://interface.music.163.com/api/load/slow',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://interface.music.163.com/api/load/cancel',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://interface.music.163.com/api/nos/token/alloc',
      method: 'POST',
      response: () =>
        Response.json({
          code: 200,
          result: {
            objectKey: 'local/object',
            docId: 'local-doc',
            token: 'fake-token',
            resourceId: 'local-resource',
          },
        }),
    },
    {
      url: 'https://nosup-hz1.127.net/yyimgs/local/object?offset=0&complete=true&version=1.0',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://interface.music.163.com/api/user/avatar/upload/v1',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://ymusic.nos-hz.163yun.com/local%2Fobject?uploads',
      method: 'POST',
      response: () =>
        new Response(
          '<InitiateMultipartUploadResult><UploadId>local-upload</UploadId></InitiateMultipartUploadResult>',
        ),
    },
    ...[1, 2].map((part) => ({
      url: `https://ymusic.nos-hz.163yun.com/local%2Fobject?partNumber=${part}&uploadId=local-upload`,
      method: 'PUT',
      response: () => new Response('', { headers: { etag: 'local-etag' } }),
    })),
    {
      url: 'https://ymusic.nos-hz.163yun.com/local%2Fobject?uploadId=local-upload',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://interface.music.163.com/api/voice/workbench/voice/batch/upload/preCheck',
      method: 'POST',
      response: success,
    },
    {
      url: 'https://interface.music.163.com/api/voice/workbench/voice/batch/upload/v2',
      method: 'POST',
      response: success,
    },
  ];
  const server = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    error: () =>
      new Response('Strict loopback rejected request', { status: 500 }),
    fetch: async (request) => {
      calls += 1;
      active += 1;
      peak = Math.max(peak, active);
      try {
        const logical = new URL(request.url).searchParams.get('logical') ?? '';
        const selected = mode;
        const route = routes.find(
          (entry) => entry.url === logical && entry.method === request.method,
        );
        if (!route || calls > 100_000)
          throw new Error(
            `Unexpected loopback route: ${request.method} ${logical}`,
          );
        const path = new URL(logical).pathname;
        paths[path] = (paths[path] ?? 0) + 1;
        const body =
          request.method === 'GET' || request.method === 'HEAD'
            ? undefined
            : await request.arrayBuffer();
        return await withScenario(
          [
            {
              ...route,
              response: async (wire) => {
                if (path === '/api/radio/like')
                  writes.push(new URLSearchParams(wire.body).get('like') ?? '');
                await Bun.sleep(delayMs);
                if (selected === 'http429')
                  return Response.json(
                    { code: 200 },
                    { status: 429, headers: { 'Retry-After': '1' } },
                  );
                if (selected === 'plain429')
                  return new Response('{"code":429}', {
                    headers: {
                      'Content-Type': 'text/plain',
                      'Retry-After': '1',
                    },
                  });
                if (selected === 'slow-body') {
                  active += 1;
                  return new Response(
                    new ReadableStream({
                      start: (controller) =>
                        controller.enqueue(new TextEncoder().encode('{')),
                      cancel: () => {
                        cancelled += 1;
                        active -= 1;
                      },
                    }),
                  );
                }
                return route.response();
              },
            },
          ],
          (scenario) =>
            scenario.fetcher(logical, {
              method: request.method,
              headers: request.headers,
              body,
            }),
        );
      } catch (error) {
        const failure =
          error instanceof Error ? error : new Error(String(error));
        failures.push(failure);
        throw failure;
      } finally {
        active -= 1;
      }
    },
  });
  const origin = new URL(`http://127.0.0.1:${server.port}`);
  const disallow = allowLoopback(origin);
  const fetcher: FetchLike = async (input, init) => {
    const logical = input instanceof Request ? input.url : String(input);
    const socket = new URL('/', origin);
    socket.searchParams.set('logical', logical);
    sent.push({
      logical,
      socket: socket.href,
      method: init?.method ?? (input instanceof Request ? input.method : 'GET'),
    });
    const wire = await readWireRequest(input, init);
    const response = await fetch(socket, {
      method: wire.method,
      headers: wire.headers,
      body:
        wire.method === 'GET' || wire.method === 'HEAD'
          ? undefined
          : await wire.request.arrayBuffer(),
      signal: wire.signal,
      redirect: 'manual',
    });
    if (response.status >= 300 && response.status < 400)
      throw new Error('Fake upstream redirect rejected');
    return response;
  };
  const dispose = async () => {
    try {
      await server.stop(true);
    } finally {
      disallow();
    }
    if (active)
      failures.push(new Error(`Loopback leaked ${active} active resources`));
    if (failures.length)
      throw new AggregateError(
        failures,
        failures.map((failure) => failure.message).join('; '),
      );
  };
  return {
    fetcher,
    sent,
    get metrics() {
      return {
        calls,
        active,
        peak,
        cancelled,
        paths: { ...paths },
        writes: [...writes],
      };
    },
    setMode: (next: FakeMode) => {
      mode = next;
    },
    stop: dispose,
    [Symbol.asyncDispose]: dispose,
  };
};
