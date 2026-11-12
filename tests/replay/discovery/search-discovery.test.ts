import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import type { NcmApiResponse } from '../../../index.ts';
import { projectRoot, settle } from '../../_kit/assertions.ts';
import { replay, replayRaw } from '../../_kit/replay.ts';
import baselines from '../../fixtures/requests/search-discovery-replays.json';

// #128 收窄输入后，这些录制的历史查询形式（数字 cursor、非数字 limit/offset）不再是合法业务输入；
// 用等价合法输入回放同一响应，继续核对上游返回体与公开状态。
const validQueries: Readonly<Record<string, unknown>> = {
  'tests/fixtures/netease/home/homepage_block_page.invalid-cursor.json': {
    cursor: 'invalid-cursor',
  },
  'tests/fixtures/netease/recommend/personalized.invalid-limit.json': {
    limit: 7,
  },
  'tests/fixtures/netease/recommend/personalized_newsong.invalid-limit.json': {
    limit: 3,
  },
  'tests/fixtures/netease/recommend/personalized_privatecontent_list.invalid-offset.json':
    {
      offset: 2,
    },
};

const invalidInputPaths = new Set([
  'tests/fixtures/netease/simi/simi_artist.missing-id.json',
  'tests/fixtures/netease/simi/simi_playlist.missing-id.json',
  'tests/fixtures/netease/simi/simi_song.missing-id.json',
  'tests/fixtures/netease/simi/simi_user.missing-id.json',
  'tests/fixtures/netease/style/style_album.missing-tag.json',
  'tests/fixtures/netease/style/style_artist.missing-tag.json',
  'tests/fixtures/netease/style/style_detail.missing-tag.json',
  'tests/fixtures/netease/style/style_playlist.missing-tag.json',
  'tests/fixtures/netease/style/style_song.missing-tag.json',
  'tests/fixtures/netease/playlist/top_playlist.invalid-limit.json',
]);

for (const entry of baselines) {
  if (invalidInputPaths.has(entry.path)) {
    test(`discovery rejects the removed input for ${entry.path} before sending`, async () => {
      const recording = JSON.parse(
        await readFile(`${projectRoot}/${entry.path}`, 'utf8'),
      );
      const client = replay(recording.response.body, recording.response.status);
      const method = entry.module.replace(/_([a-z])/g, (_, letter: string) =>
        letter.toUpperCase(),
      );
      const call = client[method as keyof typeof client] as (
        query: unknown,
      ) => Promise<NcmApiResponse>;
      expect(await settle(call(recording.query))).toMatchObject({
        rejected: { status: 400 },
      });
    });
    continue;
  }

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
    const result = await settle(
      call(validQueries[entry.path] ?? recording.query),
    );
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
