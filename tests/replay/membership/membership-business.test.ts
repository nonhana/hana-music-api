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
import baselines from '../../fixtures/requests/membership-business-replays.json';
import requests from '../../fixtures/requests/membership-business.json';

for (const entry of baselines) {
  test(`membership replays the original ${entry.path} public response`, async () => {
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
    const result = await settle(
      invokeModule(entry.module as ModuleIdentifier, query as ModuleQuery, {
        cookie: 'MUSIC_U=replay-fixture',
        fetcher: async () => {
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
        },
      }),
    );
    expect(sends).toBe(1);
    expect(result).toHaveProperty(entry.outcome);
    const response = 'resolved' in result ? result.resolved : result.rejected;
    expect(response.status).toBe(entry.status);
    // Captured through the original SDK at 06f1791; synthetic transport cookies are separate from the unchanged recording.
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
