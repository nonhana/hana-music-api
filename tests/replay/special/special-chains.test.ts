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
import baselines from '../../fixtures/requests/special-chains-replays.json';

for (const entry of baselines) {
  test(`special replays the original ${entry.path} public response`, async () => {
    const raw = await readFile(`${projectRoot}/${entry.path}`);
    expect(createHash('sha256').update(raw).digest('hex')).toBe(
      entry.recordingSha256,
    );
    const recording = JSON.parse(
      entry.path.endsWith('.gz') ? gunzipSync(raw).toString() : raw.toString(),
    );
    let upstream = [recording.response.body];
    if (entry.module === 'playlist_cover_update')
      upstream = [recording.response.body.data];
    if (entry.module === 'image_upload_token') {
      const data = recording.response.body.data;
      upstream = [
        {
          code: 200,
          result: {
            docId: data.imgId,
            token: 'synthetic-replay-nos',
            objectKey: data.url_pre.slice('https://p1.music.126.net/'.length),
          },
        },
      ];
    }
    if (entry.module === 'playlist_track_all')
      upstream = [
        {
          code: 200,
          playlist: {
            trackIds: recording.response.body.songs.map(
              (song: { id: number | string }) => ({ id: song.id }),
            ),
          },
        },
        recording.response.body,
      ];
    if (entry.module === 'scrobble')
      upstream = [recording.response.body, recording.response.body];
    if (entry.module === 'login_qr_create') upstream = [];
    let sends = 0;
    const query =
      entry.module === 'playlist_tracks'
        ? {
            ...entry.query,
            tracks: String((entry.query as { tracks?: unknown }).tracks).split(
              ',',
            ),
          }
        : entry.query;
    const result = await settle(
      invokeModule(entry.module as ModuleIdentifier, query as ModuleQuery, {
        cookie: 'MUSIC_U=synthetic-replay',
        fetcher: async () => {
          expect(sends).toBeLessThan(entry.sends);
          return Response.json(upstream[sends++], {
            status: recording.response.status,
          });
        },
      }),
    );
    expect(sends).toBe(entry.sends);
    expect(result).toHaveProperty(entry.outcome);
    const response = 'resolved' in result ? result.resolved : result.rejected;
    expect(response.status).toBe(entry.status);
    // Fixed old SDK output at ea108c8; original files and metadata remain unchanged.
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
