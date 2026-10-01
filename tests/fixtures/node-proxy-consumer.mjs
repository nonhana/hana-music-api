import { createServer } from 'node:http';
import { createConnection } from 'node:net';

import { createRequest } from '../../dist/index.js';

let upstreamCalls = 0;
let tunnelCalls = 0;
const sockets = new Set();
const upstream = createServer((request, response) => {
  upstreamCalls += 1;
  request.resume();
  if (request.url === '/api/slow') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write('{');
    return;
  }
  response.end(JSON.stringify({ code: 200 }));
});
const proxy = createServer();
proxy.on('connect', (request, downstream, head) => {
  tunnelCalls += 1;
  const [hostname, port] = request.url.split(':');
  if (hostname !== '127.0.0.1' || Number(port) !== upstream.address().port) {
    throw new Error('Unexpected proxy socket target');
  }
  const socket = createConnection(
    { host: hostname, port: Number(port) },
    () => {
      downstream.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      socket.write(head);
      socket.pipe(downstream);
      downstream.pipe(socket);
    },
  );
  sockets.add(socket);
  sockets.add(downstream);
  socket.on('error', () => downstream.destroy());
  downstream.on('error', () => socket.destroy());
});
await new Promise((resolve) => upstream.listen(0, '127.0.0.1', resolve));
await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
const config = {
  crypto: 'api',
  state: { anonymousToken: '' },
  domain: `http://127.0.0.1:${upstream.address().port}`,
  proxy: `http://127.0.0.1:${proxy.address().port}`,
  timeoutMs: 500,
};
try {
  const success = await createRequest('/api/test', {}, config);
  if (success.status !== 200 || upstreamCalls !== 1 || tunnelCalls !== 1) {
    throw new Error('Proxy forwarding failed');
  }
  const timed = await createRequest(
    '/api/slow',
    {},
    { ...config, timeoutMs: 30 },
  ).catch((error) => error);
  if (timed.status !== 504) {
    throw new Error('Slow body deadline failed');
  }
  const controller = new AbortController();
  const cancelled = createRequest(
    '/api/slow',
    {},
    { ...config, signal: controller.signal },
  );
  setTimeout(() => controller.abort(), 20);
  let cancelledStatus;
  try {
    await cancelled;
  } catch (error) {
    cancelledStatus = error.status;
  }
  if (cancelledStatus !== 499) {
    throw new Error('Cancellation failed');
  }
  const unavailable = await createRequest(
    '/api/test',
    {},
    { ...config, proxy: 'http://127.0.0.1:1', timeoutMs: 100 },
  ).catch((error) => error);
  if (![502, 504].includes(unavailable.status) || upstreamCalls !== 3) {
    throw new Error('Proxy failure silently used a direct connection');
  }
  console.log(
    JSON.stringify({
      node: process.versions.node,
      upstreamCalls,
      tunnelCalls,
      timeout: timed.status,
      proxyFailure: unavailable.status,
    }),
  );
} finally {
  for (const socket of sockets) {
    socket.destroy();
  }
  upstream.closeAllConnections();
  proxy.closeAllConnections();
  await Promise.all([
    new Promise((resolve) => upstream.close(resolve)),
    new Promise((resolve) => proxy.close(resolve)),
  ]);
}
