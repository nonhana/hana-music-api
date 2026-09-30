import { expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  createClientLayer,
  createProcessLayer,
  runCall,
} from '../src/core/call.ts';
import { loadModuleDefinitions } from '../src/server/module-loader.ts';

test.each([true, false])(
  'dynamic module directory preserves decoder contract: %s',
  async (decode) => {
    const directory = await mkdtemp(resolve(tmpdir(), 'hana-module-loader-'));
    const modulePath = resolve(directory, 'custom.ts');
    let registrations = 0;
    try {
      await writeFile(
        modulePath,
        `
import { Effect } from ${JSON.stringify(import.meta.resolve('effect'))}
import { InvalidModuleInput } from ${JSON.stringify(new URL('../src/core/errors.ts', import.meta.url).href)}
export let executions = 0
${decode ? "export const decodeModuleInput = (input) => typeof input.id === 'string' ? Effect.succeed({ id: input.id }) : Effect.fail(new InvalidModuleInput({ message: 'id must be a string' }))" : ''}
export default (input) => Effect.sync(() => { executions += 1; return { status: 200, cookie: [], body: input } })
`,
      );
      if (!decode) {
        const result = await loadModuleDefinitions(directory).catch(
          (error: unknown) => error,
        );
        expect(result).toBeInstanceOf(TypeError);
        expect(String(result)).toContain('decodeModuleInput');
        return;
      }
      const [definition] = await loadModuleDefinitions(directory);
      const namespace = await import(pathToFileURL(modulePath).href);
      const services = createClientLayer(createProcessLayer(), {
        identityPool: { size: 1 },
        fetcher: async () => {
          registrations += 1;
          return Response.json(
            { code: 200 },
            { headers: { 'set-cookie': 'MUSIC_A=loader-test; Path=/' } },
          );
        },
      });
      const input = { id: 42, future: { enabled: true } };
      const result = await runCall(
        { identifier: 'custom', input, config: {} },
        services,
        definition!,
      ).catch((error: unknown) => error);
      if (decode) {
        expect(result).toMatchObject({
          status: 400,
          body: { msg: 'id must be a string' },
        });
        expect(registrations).toBe(0);
        expect(namespace.executions).toBe(0);
        const success = await runCall(
          {
            identifier: 'custom',
            input: { id: '42', extra: true },
            config: {},
          },
          services,
          definition!,
        );
        expect(success.body).toEqual({ id: '42' });
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
