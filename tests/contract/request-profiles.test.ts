import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { ModuleCallConfig } from '../../index.ts';
import { createHanaMusicApi } from '../../index.ts';
import { REQUEST_PROFILES } from '../../src/core/request-profile.ts';
import { moduleRequestProfiles } from '../../src/sdk/module-profiles.ts';
import { discoverModuleFiles } from '../../src/server/module-discovery.ts';

interface SentRequest {
  readonly body: string;
  readonly bodyKeys: Array<string>;
  readonly cookie: Map<string, string>;
  readonly headers: Headers;
  readonly userAgent: string;
  readonly url: string;
}

const createClient = (
  config: Pick<
    ModuleCallConfig,
    'checkToken' | 'cookie' | 'crypto' | 'headers' | 'ua'
  >,
  body: unknown = { code: 200 },
) => {
  const sent: Array<SentRequest> = [];
  const client = createHanaMusicApi({
    ...config,
    fetcher: async (input, init) => {
      const headers = new Headers(init?.headers);
      const rawBody = typeof init?.body === 'string' ? init.body : '';
      sent.push({
        body: rawBody,
        bodyKeys: [...new URLSearchParams(rawBody).keys()],
        cookie: new Map(
          (headers.get('cookie') ?? '').split('; ').map((pair) => {
            const [name = '', value = ''] = pair.split('=');
            return [name, value];
          }),
        ),
        headers,
        userAgent: headers.get('user-agent') ?? '',
        url: input instanceof Request ? input.url : input.toString(),
      });
      return Response.json(body);
    },
  });
  return { client, sent };
};

const callerIdentity = {
  cookie:
    'MUSIC_U=listener; os=iphone; appver=9.0.90; osver=16.2; channel=distribution; deviceId=caller-device',
  crypto: 'eapi' as const,
  ua: 'NeteaseMusicDesktop/3.1.29.205117',
};

test('request profile registry is enumerable and evidence-backed', () => {
  expect(REQUEST_PROFILES.web).toMatchObject({
    protocol: 'weapi',
    client: 'web',
    checkToken: 'optional',
  });
  expect(REQUEST_PROFILES.desktop).toMatchObject({
    protocol: 'eapi',
    client: 'desktop',
  });
  expect(REQUEST_PROFILES.web.cookie.os).toBe('web');
  expect(REQUEST_PROFILES.desktop.cookie.os).toBe('osx');
});

test('module metadata exposes profile and token policy for every module', () => {
  expect(moduleRequestProfiles.playlist_subscribe).toEqual({
    profile: 'web',
    checkToken: 'optional',
  });
  expect(moduleRequestProfiles.playlist_create).toEqual({
    profile: 'web',
    checkToken: 'optional',
  });
  expect(moduleRequestProfiles.playlist_desc_update).toEqual({
    profile: 'web',
    checkToken: 'optional',
  });
  expect(moduleRequestProfiles.playlist_name_update).toEqual({
    profile: 'web',
    checkToken: 'none',
  });
  expect(moduleRequestProfiles.playlist_tags_update).toEqual({
    profile: 'web',
    checkToken: 'none',
  });
  expect(moduleRequestProfiles.search).toEqual({
    profile: 'legacy',
    checkToken: 'none',
  });
  expect(Object.keys(moduleRequestProfiles)).toHaveLength(352);
  expect(
    Object.entries(moduleRequestProfiles)
      .filter(([, metadata]) => metadata.profile !== 'legacy')
      .map(([identifier]) => identifier)
      .toSorted(),
  ).toEqual([
    'playlist_create',
    'playlist_desc_update',
    'playlist_name_update',
    'playlist_subscribe',
    'playlist_tags_update',
  ]);
});

test('playlistCreate uses web profile and sends a configured checkToken', async () => {
  let tokenCalls = 0;
  const { client, sent } = createClient(
    {
      ...callerIdentity,
      checkToken: async () => {
        tokenCalls += 1;
        return `token-${tokenCalls}`;
      },
    },
    { code: 200, id: 1, playlist: { id: 1, name: 'demo' } },
  );

  await client.playlistCreate({ name: 'demo' });

  expect(tokenCalls).toBe(1);
  expect(sent).toHaveLength(1);
  const [request] = sent;
  expect(request?.url).toBe('https://music.163.com/weapi/playlist/create');
  expect(request?.userAgent).toBe(REQUEST_PROFILES.web.userAgent);
  expect(request?.headers.get('x-anticheattoken')).toBe('token-1');
  expect(request?.cookie.get('os')).toBe('web');
  expect(request?.cookie.get('MUSIC_U')).toBe('listener');
  expect(request?.cookie.has('appver')).toBe(false);
  expect(request?.cookie.has('osver')).toBe(false);
  expect(request?.cookie.has('channel')).toBe(false);
  expect(request?.cookie.has('deviceId')).toBe(false);
  expect(request?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
});

test('playlistDescUpdate uses web profile and sends a configured checkToken', async () => {
  const { client, sent } = createClient({
    ...callerIdentity,
    checkToken: 'desc-token',
  });

  await client.playlistDescUpdate({ id: 1, desc: 'demo' });

  expect(sent).toHaveLength(1);
  expect(sent[0]?.url).toBe('https://music.163.com/weapi/playlist/desc/update');
  expect(sent[0]?.headers.get('x-anticheattoken')).toBe('desc-token');
  expect(sent[0]?.cookie.get('os')).toBe('web');
});

test('write modules without token policy ignore configured checkToken', async () => {
  let tokenCalls = 0;
  const { client, sent } = createClient({
    ...callerIdentity,
    checkToken: () => {
      tokenCalls += 1;
      return Promise.resolve('unused-token');
    },
  });

  await client.playlistNameUpdate({ id: 1, name: 'demo' });
  await client.playlistTagsUpdate({ id: 1, tags: 'demo' });

  expect(tokenCalls).toBe(0);
  expect(sent).toHaveLength(2);
  expect(sent[0]?.url).toBe('https://music.163.com/weapi/playlist/update/name');
  expect(sent[1]?.url).toBe('https://music.163.com/weapi/playlist/tags/update');
  for (const request of sent) {
    expect(request.headers.has('x-anticheattoken')).toBe(false);
    expect(request.cookie.get('os')).toBe('web');
  }
});

test('migrated modules ignore caller crypto and UA overrides', async () => {
  const { client, sent } = createClient(callerIdentity, {
    code: 200,
    id: 1,
    playlist: { id: 1, name: 'demo' },
  });

  await client.playlistCreate({ name: 'demo' });

  expect(sent[0]?.url.startsWith('https://music.163.com/weapi/')).toBe(true);
  expect(sent[0]?.userAgent).toBe(REQUEST_PROFILES.web.userAgent);
  expect(sent[0]?.userAgent).not.toContain('NeteaseMusicDesktop');
});

test('playlistSubscribe strips forged token headers and uses only the provider', async () => {
  const { client, sent } = createClient({
    ...callerIdentity,
    checkToken: 'provider-token',
    headers: { 'X-antiCheatToken': 'forged-token' },
  });

  await client.playlistSubscribe({ id: 1, t: 1 });

  expect(sent[0]?.headers.get('x-anticheattoken')).toBe('provider-token');
});

test('modules cannot privately override crypto, UA, cookie or token headers', async () => {
  const failures: Array<string> = [];
  const modulesDirectory = resolve(import.meta.dir, '../../src/modules');
  for (const module of await discoverModuleFiles(modulesDirectory)) {
    const source = await readFile(module.filePath, 'utf8');
    if (
      /Effect\.updateService\(\s*Call\b/.test(source) ||
      /\bUSER_AGENT_MAP\b|\bOS_PROFILES\b/.test(source) ||
      /X-antiCheatToken/i.test(source)
    ) {
      failures.push(module.identifier);
    }
  }
  expect(failures).toEqual([]);
});

test('migrated module fixtures declare profile and protocol', async () => {
  const files = [
    'playlist_subscribe/own.json',
    'playlist_subscribe/subscribe.json',
    'playlist_subscribe/subscribe-token.json',
    'playlist_subscribe/unsubscribe.json',
    'playlist-edit/playlist_create.private.json',
    'playlist-edit/playlist_desc_update.json',
    'playlist-edit/playlist_name_update.json',
    'playlist-edit/playlist_tags_update.3-tags.json',
  ];
  for (const file of files) {
    const recording = JSON.parse(
      await readFile(
        resolve(import.meta.dir, '../fixtures/netease', file),
        'utf8',
      ),
    ) as { context?: { profile?: unknown; protocol?: unknown } };
    expect(recording.context?.profile).toBeString();
    expect(recording.context?.protocol).toBeString();
  }
});
