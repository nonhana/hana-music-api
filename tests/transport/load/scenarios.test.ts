import { expect, test } from 'bun:test';

import { buildCallServices, runCall } from '../../../src/core/call.ts';
import { decodeModuleObject } from '../../../src/core/module-input.ts';
import voiceUpload, {
  moduleActions as voiceUploadActions,
} from '../../../src/modules/voice_upload.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import { settle } from '../../_kit/assertions.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import { plainRequest } from '../../_kit/module.ts';
import { createFakeUpstream } from '../../_kit/upstream/loopback.ts';

test.each(['text/plain', 'text/html', ''])(
  'raw business 429 is recognized without a JSON content type (%s)',
  async (contentType) => {
    const fetcher = async () =>
      new Response('{"code":429}', {
        headers: contentType ? { 'Content-Type': contentType } : {},
      });
    expect(
      plainRequest({ fetcher })('https://music.163.com/raw/page'),
    ).rejects.toMatchObject({ status: 429 });
  },
);

test('a local multipart upload stops after the first cancelled part', async () => {
  await using fake = createFakeUpstream(1);
  const controller = new AbortController();
  let parts = 0;
  const failure = await runCall(
    {
      identifier: 'voice_upload',
      input: {
        songFile: {
          data: new Uint8Array(10 * 1024 * 1024 + 1),
          name: 'local.mp3',
          size: 10 * 1024 * 1024 + 1,
          mimetype: 'audio/mpeg',
        },
      },

      config: {
        signal: controller.signal,
        cookie: 'MUSIC_U=local-upload',

        fetcher: async (url, init) => {
          const response = await fake.fetcher(url, init);
          const address =
            typeof url === 'string'
              ? url
              : url instanceof URL
                ? url.href
                : url.url;
          if (address.includes('partNumber=')) {
            parts += 1;
            controller.abort();
          }
          return response;
        },
      },
    },
    buildCallServices({}, false, { entropy: testEntropy }),
    {
      identifier: 'voice_upload',
      route: '/voice/upload',
      decodeInput: decodeModuleObject,
      actions: voiceUploadActions,
      execute: voiceUpload,
    },
  ).catch((error: unknown) => error);
  expect(failure).toMatchObject({
    status: 499,
    body: { partialCompletion: true },
  });
  expect(parts).toBe(1);
  expect(fake.metrics.calls).toBe(3);
  expect(fake.sent).toHaveLength(3);
  expect(
    fake.sent.every((entry) => new URL(entry.socket).hostname === '127.0.0.1'),
  ).toBe(true);
});

test('loopback accepts declared PC like actions and decodes each write in order', async () => {
  const observed = await settle(
    (async () => {
      await using fake = createFakeUpstream(1);
      const config = { cookie: 'MUSIC_U=loopback-listener' };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, {
          fetcher: fake.fetcher,
          entropy: testEntropy,
        }),
      );
      for (const like of [true, false, true])
        await client.like({ id: 17, like });
      return {
        writes: fake.metrics.writes,
        sent: fake.sent,
        active: fake.metrics.active,
      };
    })(),
  );
  expect(observed).toHaveProperty('resolved');
  if (!('resolved' in observed)) return;
  expect(observed.resolved.writes).toEqual(['true', 'false', 'true']);
  expect(observed.resolved.active).toBe(0);
  expect(observed.resolved.sent.map((entry) => entry.logical)).toEqual(
    Array.from({ length: 3 }, () => 'https://music.163.com/weapi/radio/like'),
  );
});
