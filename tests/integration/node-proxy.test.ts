import { expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

test('Node SDK rejects unavailable proxies without direct upstream fallback', async () => {
  const child = spawn(
    process.env.HANA_TEST_NODE ?? 'node',
    [resolve('tests/fixtures/node-proxy-consumer.mjs')],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let output = '';
  let errors = '';
  child.stdout.on('data', (chunk) => {
    output += String(chunk);
  });
  child.stderr.on('data', (chunk) => {
    errors += String(chunk);
  });
  const code = await new Promise<number | null>((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', resolveExit);
  });
  expect(code, errors).toBe(0);
  expect(JSON.parse(output)).toMatchObject({ upstreamCalls: 3, timeout: 504 });
});
