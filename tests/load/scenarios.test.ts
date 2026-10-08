import { expect, test } from 'bun:test';

import { buildCallServices, runCall } from '../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../src/core/module-input.ts';
import voiceUpload from '../../src/modules/voice_upload.ts';
import { createFakeUpstream } from '../fixtures/fake-upstream.ts';
import { plainRequest } from '../fixtures/request-capability.ts';

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
  const fake = createFakeUpstream(1);
  const controller = new AbortController();
  let parts = 0;
  try {
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
        signal: controller.signal,
        config: {
          cookie: 'MUSIC_U=local-upload',
          crypto: 'api',
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
      buildCallServices(),
      {
        identifier: 'voice_upload',
        route: '/voice/upload',
        decodeInput: decodeLegacyModuleInput,
        execute: voiceUpload,
      },
    ).catch((error: unknown) => error);
    expect(failure).toMatchObject({
      status: 499,
      body: { partialCompletion: true },
    });
    expect(parts).toBe(1);
    expect(fake.metrics.calls).toBe(3);
  } finally {
    await fake.stop();
  }
});
