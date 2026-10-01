import type { FetchLike } from '../../src/types/index.ts';

export type FakeMode =
  | 'healthy'
  | 'http429'
  | 'business429'
  | 'plain429'
  | 'slow-body';

export const createFakeUpstream = (delayMs = 50) => {
  let mode: FakeMode = 'healthy';
  let active = 0;
  let peak = 0;
  let calls = 0;
  let cancelled = 0;
  const paths: Record<string, number> = {};
  const writes: Array<string> = [];
  const server = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch: async (request) => {
      calls += 1;
      active += 1;
      peak = Math.max(peak, active);
      const path = new URL(request.url).searchParams.get('logical') ?? '';
      const selected = mode;
      const pathname = path.split('?')[0] ?? path;
      paths[pathname] = (paths[pathname] ?? 0) + 1;
      try {
        const body = await request.text();
        if (pathname === '/api/radio/like') {
          writes.push(new URLSearchParams(body).get('like') ?? '');
        }
        await Bun.sleep(delayMs);
        if (selected === 'http429') {
          return Response.json(
            { code: 200 },
            { status: 429, headers: { 'Retry-After': '1' } },
          );
        }
        if (selected === 'business429') {
          return Response.json(
            { code: 429 },
            { headers: { 'Retry-After': '1' } },
          );
        }
        if (selected === 'plain429') {
          return new Response('{"code":429}', {
            headers: { 'Content-Type': 'text/plain', 'Retry-After': '1' },
          });
        }
        if (selected === 'slow-body') {
          active += 1;
          return new Response(
            new ReadableStream({
              start: (controller) => {
                controller.enqueue(new TextEncoder().encode('{'));
              },
              cancel: () => {
                cancelled += 1;
                active -= 1;
              },
            }),
          );
        }
        if (path.includes('?uploads')) {
          return new Response(
            '<InitiateMultipartUploadResult><UploadId>local-upload</UploadId></InitiateMultipartUploadResult>',
          );
        }
        if (path.includes('partNumber=')) {
          return new Response('', { headers: { etag: 'local-etag' } });
        }
        if (path.includes('/lbs')) {
          return Response.json({ upload: ['https://nosup-hz1.127.net'] });
        }
        if (path.includes('nos/token/alloc')) {
          return Response.json({
            code: 200,
            result: {
              objectKey: 'local/object',
              docId: 'local-doc',
              token: 'fake-token',
              resourceId: 'local-resource',
            },
          });
        }
        return Response.json({
          code: 200,
          result: { songs: [] },
          data: [],
          lrc: { lyric: 'local' },
        });
      } finally {
        active -= 1;
      }
    },
  });
  const origin = new URL(`http://127.0.0.1:${server.port}`);
  const fetcher: FetchLike = async (input, init) => {
    const logical = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
    );
    if (
      logical.protocol !== 'https:' ||
      !(
        logical.hostname === 'music.163.com' ||
        logical.hostname === 'interface.music.163.com' ||
        logical.hostname.endsWith('.127.net') ||
        logical.hostname.endsWith('.163yun.com')
      )
    ) {
      throw new Error('Fake transport rejected logical upstream');
    }
    const socket = new URL('/', origin);
    socket.searchParams.set('logical', `${logical.pathname}${logical.search}`);
    if (
      socket.hostname !== '127.0.0.1' ||
      socket.port !== String(server.port)
    ) {
      throw new Error('Non-loopback socket target rejected');
    }
    const response = await fetch(socket, { ...init, redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      throw new Error('Fake upstream redirect rejected');
    }
    return response;
  };
  return {
    fetcher,
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
    stop: () => server.stop(true),
  };
};
