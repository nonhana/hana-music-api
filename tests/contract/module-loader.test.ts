import { expect, spyOn, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { runCall } from '../../src/core/call.ts';
import { createServer } from '../../src/server/create-server.ts';
import { loadModuleDefinitions } from '../../src/server/module-loader.ts';
import { clientLayer } from '../_kit/layers.ts';

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
import { InvalidModuleInput } from ${JSON.stringify(new URL('../../src/core/errors.ts', import.meta.url).href)}
export let executions = 0
${decode ? "export const decodeModuleInput = (input) => typeof input.id === 'string' ? Effect.succeed({ id: input.id }) : Effect.fail(InvalidModuleInput.make({ message: 'id must be a string' }))" : ''}
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
      const services = clientLayer({
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

const dynamicActionCases: Array<{
  action: string;
  target: string;
  status: number;
  declaration?: string | { prefix: string };
  loadRejected?: boolean;
}> = [
  { action: 'cancel', target: '/api/playlist/unsubscribe', status: 200 },
  { action: 'missing', target: '/api/playlist/unsubscribe', status: 400 },
  { action: 'toString', target: '/api/playlist/unsubscribe', status: 400 },
  { action: 'cancel', target: '/api/user/delete', status: 400 },
  { action: 'cancel', target: '/api/playlist/../user/delete', status: 400 },
  {
    action: 'cancel',
    target: '/api/playlist/../../api/user/delete',
    status: 400,
  },
  { action: 'cancel', target: '/api/playlist/%2e%2e/user/delete', status: 400 },
  { action: 'cancel', target: '/api/playlist/.%2E/user/delete', status: 400 },
  { action: 'cancel', target: '/api/playlist/..\\user/delete', status: 400 },
  {
    action: 'cancel',
    target: '/api/playlist/item/../unsubscribe',
    status: 200,
  },
  {
    action: 'cancel',
    target: '/api/playlist/item/../unsubscribe',
    status: 200,
    declaration: '/api/playlist/unsubscribe',
  },
  {
    action: 'cancel',
    target: '/api/playlists/delete',
    status: 400,
    declaration: { prefix: '/api/playlist' },
  },
  {
    action: 'cancel',
    target: '/api/playlist/unsubscribe?other=/api/user/delete',
    status: 400,
  },
  { action: 'cancel', target: '/api/playlist/unsubscribe#other', status: 400 },
  {
    action: 'cancel',
    target: '//other.example/api/playlist/unsubscribe',
    status: 400,
  },
  {
    action: 'cancel',
    target: 'https://other.example/api/playlist/unsubscribe',
    status: 400,
  },
  {
    action: 'cancel',
    target: '/api/user/delete',
    status: 400,
    declaration: '/api/playlist/../user/delete',
    loadRejected: true,
  },
  {
    action: 'cancel',
    target: '/api/user/delete',
    status: 400,
    declaration: { prefix: '/api/playlist/%2e%2e/user/' },
    loadRejected: true,
  },
];

test.each(dynamicActionCases)(
  'dynamic HTTP module allows only its declared action and target: $action $target',
  async ({
    action,
    target,
    status,
    declaration = { prefix: '/api/playlist/' },
    loadRejected,
  }) => {
    const directory = await mkdtemp(resolve(tmpdir(), 'hana-module-actions-'));
    const sent: Array<{ url: string; cookie: string }> = [];
    const upstream = spyOn(globalThis, 'fetch').mockImplementation(
      Object.assign(
        async (input: Request | URL | string, init?: RequestInit) => {
          sent.push({
            url: input instanceof Request ? input.url : input.toString(),
            cookie: new Headers(init?.headers).get('cookie') ?? '',
          });
          return Response.json({ code: 200 });
        },
        { preconnect: globalThis.fetch.preconnect },
      ),
    );
    try {
      await writeFile(
        resolve(directory, 'custom.ts'),
        `
import { Effect } from ${JSON.stringify(import.meta.resolve('effect'))}
export const decodeModuleInput = (input) => Effect.succeed(input)
export const moduleActions = {
  cancel: { profile: 'web', target: ${JSON.stringify(declaration)}, semantic: 'write', token: 'none', cache: 'none', retry: 'never' },
}
export default (input, request) => request({ action: input.action, target: input.target, protocol: 'weapi', method: 'POST', headers: {}, body: '{}', response: 'json', semantic: 'write' }).pipe(Effect.map((response) => ({ status: response.status, cookie: response.cookie, body: response.body })))
`,
      );
      if (loadRejected) {
        const result = await createServer({
          modulesDirectory: directory,
        }).catch((error: unknown) => error);
        expect(result).toBeInstanceOf(Error);
        expect(String(result)).toContain('canonical');
        expect(sent).toHaveLength(0);
        return;
      }
      const app = await createServer({ modulesDirectory: directory });
      const response = await app.request(
        `/custom?action=${action}&target=${encodeURIComponent(target)}`,
        {
          headers: {
            cookie: 'MUSIC_U=external-listener; os=iphone; appver=mobile',
          },
        },
      );
      expect(response.status).toBe(status);
      expect(sent).toHaveLength(status === 200 ? 1 : 0);
      if (status === 200) {
        expect(sent[0]!.url).toBe(
          'https://music.163.com/weapi/playlist/unsubscribe',
        );
        expect(sent[0]!.cookie).toContain('MUSIC_U=external-listener');
        expect(sent[0]!.cookie).toContain('os=web');
        expect(sent[0]!.cookie).not.toContain('appver=');
      }
    } finally {
      upstream.mockRestore();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
