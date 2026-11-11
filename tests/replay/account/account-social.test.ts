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
import baselines from '../../fixtures/requests/account-social-replays.json';
import requests from '../../fixtures/requests/account-social.json';

const splitList = (value: unknown) =>
  Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').filter(Boolean)
      : [];

const toBusinessQuery = (
  module: string,
  query: Record<string, unknown>,
): Record<string, unknown> => {
  if ('user_ids' in query) {
    const ids = query.user_ids;
    const { user_ids: _userIds, ...rest } = query;
    return {
      ...rest,
      userIds: Array.isArray(ids)
        ? ids
        : String(ids)
            .split(',')
            .map((id) => id.trim()),
    };
  }
  if (typeof query.nicknames === 'string') {
    return { ...query, nicknames: query.nicknames.split(';') };
  }
  if (module === 'user_cloud_detail' && typeof query.id === 'string') {
    const { id, ...rest } = query;
    return { ...rest, ids: id.split(',').map((value) => value.trim()) };
  }
  if (
    module === 'listentogether_room_check' ||
    module === 'listentogether_sync_playlist_get'
  ) {
    return { ...query, roomId: String(query.roomId) };
  }
  if (module === 'listentogether_sync_list_command') {
    return {
      ...query,
      displayList: splitList(query.displayList),
      randomList: splitList(query.randomList),
    };
  }
  return query;
};

const invalidInputPaths = new Set([
  'tests/fixtures/netease/topic/hot_topic.invalid-limit.json',
  'tests/fixtures/netease/topic/topic_sublist.invalid-offset.json',
]);

for (const entry of baselines) {
  test(`account replays the original ${entry.path} public response`, async () => {
    const raw = await readFile(`${projectRoot}/${entry.path}`);
    expect(createHash('sha256').update(raw).digest('hex')).toBe(
      entry.recordingSha256,
    );
    const recording = JSON.parse(
      entry.path.endsWith('.gz') ? gunzipSync(raw).toString() : raw.toString(),
    );
    // These old recordings contain the SDK wrapper; extracting data restores their documented upstream input.
    const body = ['login_qr_key', 'login_status'].includes(entry.module)
      ? recording.response.body.data
      : recording.response.body;
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
    const businessQuery = toBusinessQuery(entry.module, query);
    const isLegacyInvalidEventInput =
      entry.module === 'event' && query.pagesize === 'abc';
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
    if (isLegacyInvalidEventInput || invalidInputPaths.has(entry.path)) {
      expect(sends).toBe(0);
      expect(result).toHaveProperty('rejected.status', 400);
      return;
    }
    expect(sends).toBe(1);
    expect(result).toHaveProperty(entry.outcome);
    const response = 'resolved' in result ? result.resolved : result.rejected;
    expect(response.status).toBe(entry.status);
    // Captured through the original SDK at 11f7b81; synthetic transport cookies are separate from the unchanged recording.
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
