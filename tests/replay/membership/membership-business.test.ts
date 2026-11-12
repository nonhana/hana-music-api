import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

import { Exit } from 'effect';
import type { Effect } from 'effect';

import { invokeModule } from '../../../index.ts';
import type {
  ModuleIdentifier,
  ModuleQuery,
} from '../../../src/types/index.ts';
import { projectRoot, settle } from '../../_kit/assertions.ts';
import { runExit } from '../../_kit/it.ts';
import baselines from '../../fixtures/requests/membership-business-replays.json';
import requests from '../../fixtures/requests/membership-business.json';

const validQueries: Readonly<Record<string, Record<string, unknown>>> = {
  'tests/fixtures/netease/digital-album/digitalAlbum_sales.default.json': {
    ids: [17, 19],
  },
  'tests/fixtures/netease/digital-album/digitalAlbum_sales.empty.json': {
    ids: [17, 19],
  },
  'tests/fixtures/netease/digital-album/digitalAlbum_sales.missing-ids.json': {
    ids: [17, 19],
  },
  'tests/fixtures/netease/digital-album/digitalAlbum_sales.unknown.json': {
    ids: [17, 19],
  },
};

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
      ...(requests.cases.find(
        (candidate) =>
          candidate.module === entry.module && candidate.label === 'default',
      ) ??
        requests.cases.find((candidate) => candidate.module === entry.module))!
        .query,
      ...recording.query,
    };
    const businessQuery = {
      ...query,
      ...validQueries[entry.path],
    };
    expect(
      createHash('sha256').update(JSON.stringify(query)).digest('hex'),
    ).toBe(entry.querySha256);
    // #128：旧协议输入在 decoder 阶段被拒绝；录制本身仍是上游拒绝的证据。
    const { decodeModuleInput } = (await import(
      `../../../src/modules/${entry.module}.ts`
    )) as {
      decodeModuleInput: (input: unknown) => Effect.Effect<unknown, unknown>;
    };
    const rejectsBeforeSending = Exit.isFailure(
      await runExit(decodeModuleInput(businessQuery)),
    );
    let sends = 0;
    const result = await settle(
      invokeModule(
        entry.module as ModuleIdentifier,
        businessQuery as ModuleQuery,
        {
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
        },
      ),
    );
    if (rejectsBeforeSending) {
      expect(sends).toBe(0);
      expect(result).toHaveProperty('rejected');
      if (!('rejected' in result)) return;
      expect(result.rejected.status).toBe(400);
      return;
    }
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
