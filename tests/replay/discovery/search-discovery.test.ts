import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import type { NcmApiResponse } from '../../../index.ts';
import { projectRoot, settle } from '../../_kit/assertions.ts';
import { replay, replayRaw } from '../../_kit/replay.ts';
import baselines from '../../fixtures/requests/search-discovery-replays.json';

for (const entry of baselines) {
  test(`discovery replays the original ${entry.path} public response`, async () => {
    const recording = JSON.parse(
      await readFile(`${projectRoot}/${entry.path}`, 'utf8'),
    );
    const client =
      typeof recording.response.body === 'string'
        ? replayRaw(recording.response.body, recording.response.status)
        : replay(recording.response.body, recording.response.status);
    const method = entry.module.replace(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    const call = client[method as keyof typeof client] as (
      query: unknown,
    ) => Promise<NcmApiResponse>;
    const result = await settle(call(recording.query));
    expect(result).toHaveProperty(entry.outcome);
    const response = 'resolved' in result ? result.resolved : result.rejected;
    expect(response.status).toBe(entry.status);
    // The expected hash was captured through the public SDK at fixed cb4bcae, independently of the migrated implementation.
    expect(
      createHash('sha256').update(JSON.stringify(response.body)).digest('hex'),
    ).toBe(entry.bodySha256);
    expect(response.cookie).toEqual([]);
  });
}
