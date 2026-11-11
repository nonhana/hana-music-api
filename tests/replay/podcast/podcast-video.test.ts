import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

import { invokeModule } from '../../../index.ts';
import type {
  ModuleIdentifier,
  ModuleQuery,
} from '../../../src/types/index.ts';
import { projectRoot, settle } from '../../_kit/assertions.ts';
import baselines from '../../fixtures/requests/podcast-video-replays.json';
import requests from '../../fixtures/requests/podcast-video.json';

const invalidInputPaths = new Set([
  'tests/fixtures/netease/dj/djRadio_top.invalid-param.json',
  'tests/fixtures/netease/dj/dj_hot.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_paygift.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_radio_hot.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_recommend_type.missing-param.json',
  'tests/fixtures/netease/dj/dj_sublist.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_toplist.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_toplist_hours.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_toplist_newcomer.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_toplist_pay.invalid-limit.json',
  'tests/fixtures/netease/dj/dj_toplist_popular.invalid-limit.json',
  'tests/fixtures/netease/voice/voice_detail.unknown.json',
  'tests/fixtures/netease/voice/voicelist_list.unknown.json',
]);

for (const entry of baselines) {
  test(`content replays the original ${entry.path} public response`, async () => {
    const raw = await readFile(`${projectRoot}/${entry.path}`);
    expect(createHash('sha256').update(raw).digest('hex')).toBe(
      entry.recordingSha256,
    );
    const recording = JSON.parse(
      entry.path.endsWith('.gz') ? gunzipSync(raw).toString() : raw.toString(),
    );
    const body = recording.response.body;
    const query = {
      ...requests.cases.find(
        (candidate) =>
          candidate.module === entry.module && candidate.label === 'default',
      )!.query,
      ...recording.query,
    };
    expect(
      createHash('sha256').update(JSON.stringify(query)).digest('hex'),
    ).toBe(entry.querySha256);
    let sends = 0;
    const fetcher = async () => {
      sends++;
      const headers = new Headers();
      headers.append('set-cookie', 'MUSIC_U=replay-session; Path=/');
      headers.append('set-cookie', 'MUSIC_A=replay-anonymous; Path=/');
      return typeof body === 'string'
        ? new Response(body, {
            status: recording.response.status,
            headers,
          })
        : Response.json(body, {
            status: recording.response.status,
            headers,
          });
    };
    if (invalidInputPaths.has(entry.path)) {
      expect(
        await settle(
          invokeModule(
            entry.module as ModuleIdentifier,
            recording.query as ModuleQuery,
            { cookie: 'MUSIC_U=replay-fixture', fetcher },
          ),
        ),
      ).toMatchObject({ rejected: { status: 400 } });
      expect(sends).toBe(0);
      return;
    }
    const result = await settle(
      invokeModule(entry.module as ModuleIdentifier, query as ModuleQuery, {
        cookie: 'MUSIC_U=replay-fixture',
        fetcher,
      }),
    );
    expect(sends).toBe(1);
    expect(result).toHaveProperty(entry.outcome);
    const response = 'resolved' in result ? result.resolved : result.rejected;
    expect(response.status).toBe(entry.status);
    // Captured through the original SDK at fa40cad6; synthetic transport cookies are separate from the unchanged recording.
    expect(
      createHash('sha256').update(JSON.stringify(response.body)).digest('hex'),
    ).toBe(entry.bodySha256);
    expect(
      createHash('sha256')
        .update(JSON.stringify(response.cookie))
        .digest('hex'),
    ).toBe(entry.cookieSha256);
  });
}
