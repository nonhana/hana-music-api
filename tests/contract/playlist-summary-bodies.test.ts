import { describe, expect, expectTypeOf, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

import { PlaylistDetailBody, UserPlaylistBody } from '../../index.ts';
import type { PlaylistSummary, PlaylistUser } from '../../index.ts';
import type { Recording } from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection, settle } from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import detailOwn from '../fixtures/netease/library/playlist_detail.own-small.json';
import userPlaylist from '../fixtures/netease/library/user_playlist.json';

const endpoints = [
  {
    module: 'user_playlist',
    path: 'body.playlist[0]',
    playlist: userPlaylist.response.body.playlist[0]!,
    wrap: (playlist: object) => ({
      code: 200,
      more: false,
      playlist: [playlist],
    }),
    call: (body: unknown) => replay(body).userPlaylist(userPlaylist.query),
    validator: UserPlaylistBody,
    readPlaylist: (body: unknown) =>
      (body as { playlist: [Record<string, unknown>] }).playlist[0],
  },
  {
    module: 'playlist_detail',
    path: 'body.playlist',
    playlist: detailOwn.response.body.playlist,
    wrap: (playlist: object) => ({ code: 200, playlist }),
    call: (body: unknown) => replay(body).playlistDetail(detailOwn.query),
    validator: PlaylistDetailBody,
    readPlaylist: (body: unknown) =>
      (body as { playlist: Record<string, unknown> }).playlist,
  },
];

const playlistNumberFields = [
  'trackCount',
  'updateTime',
  'trackUpdateTime',
  'playCount',
  'privacy',
  'specialType',
  'status',
  'adType',
  'backgroundCoverId',
  'cloudTrackCount',
  'coverImgId',
  'createTime',
  'subscribedCount',
  'titleImage',
  'trackNumberUpdateTime',
  'userId',
];
const playlistStringFields = [
  'name',
  'coverImgUrl',
  'commentThreadId',
  'description',
  'backgroundCoverUrl',
  'coverImgId_str',
  'englishTitle',
  'titleImageUrl',
  'updateFrequency',
];
const playlistBooleanFields = [
  'subscribed',
  'copied',
  'highQuality',
  'mix',
  'newImported',
  'opRecommend',
  'ordered',
];
const loosePlaylistFields = [
  ...playlistNumberFields,
  ...playlistStringFields,
  ...playlistBooleanFields,
  'tags',
  'creator',
  'subscribers',
];

const userNumberFields = [
  'userId',
  'accountStatus',
  'authStatus',
  'authenticationTypes',
  'authority',
  'avatarImgId',
  'backgroundImgId',
  'birthday',
  'city',
  'djStatus',
  'gender',
  'province',
  'userType',
  'vipType',
];
const userStringFields = [
  'nickname',
  'avatarImgIdStr',
  'avatarImgId_str',
  'avatarUrl',
  'description',
  'detailDescription',
  'signature',
  'backgroundImgIdStr',
  'backgroundUrl',
];
const userBooleanFields = ['anchor', 'defaultAvatar', 'followed', 'mutual'];
const userFields = [
  ...userNumberFields,
  ...userStringFields,
  ...userBooleanFields,
  'expertTags',
  'avatarDetail',
  'experts',
];

const wrongPlaylistValue = (field: string) =>
  field === 'creator'
    ? []
    : field === 'subscribers' || field === 'tags'
      ? {}
      : playlistNumberFields.includes(field)
        ? '1'
        : playlistStringFields.includes(field)
          ? false
          : 1;

const wrongUserValue = (field: string) =>
  userNumberFields.includes(field)
    ? '1'
    : userStringFields.includes(field)
      ? false
      : userBooleanFields.includes(field)
        ? 1
        : field === 'expertTags'
          ? false
          : [];

const without = (object: object, field: string) => {
  const copy: Record<string, unknown> = { ...object };
  delete copy[field];
  return copy;
};

for (const endpoint of endpoints) {
  describe(endpoint.module, () => {
    test('rejects a missing playlist id', async () => {
      await expectUpstreamShapeRejection(
        endpoint.call(endpoint.wrap(without(endpoint.playlist, 'id'))),
        {
          module: endpoint.module,
          path: `${endpoint.path}.id`,
          expected: 'present',
          actual: 'missing',
        },
      );
    });

    test.each([
      { value: '1', expected: 'number', actual: 'string' },
      { value: null, expected: 'number', actual: 'null' },
    ])(
      'rejects playlist.id with an unusable value: $value',
      async ({ value, expected, actual }) => {
        await expectUpstreamShapeRejection(
          endpoint.call(endpoint.wrap({ ...endpoint.playlist, id: value })),
          {
            module: endpoint.module,
            path: `${endpoint.path}.id`,
            expected,
            actual,
          },
        );
      },
    );

    test.each(loosePlaylistFields)(
      'treats a missing playlist.%s as absent',
      async (field) => {
        const result = await endpoint.call(
          endpoint.wrap(without(endpoint.playlist, field)),
        );
        expect(endpoint.readPlaylist(result.body)).not.toHaveProperty(field);
      },
    );

    test.each(loosePlaylistFields)(
      'treats playlist.%s with the wrong type as absent',
      async (field) => {
        const result = await endpoint.call(
          endpoint.wrap({
            ...endpoint.playlist,
            [field]: wrongPlaylistValue(field),
          }),
        );
        expect(endpoint.readPlaylist(result.body)).not.toHaveProperty(field);
      },
    );

    test.each(loosePlaylistFields)(
      'keeps a null playlist.%s',
      async (field) => {
        const result = await endpoint.call(
          endpoint.wrap({ ...endpoint.playlist, [field]: null }),
        );
        expect(endpoint.readPlaylist(result.body)[field]).toBeNull();
      },
    );

    test('drops tags containing a non-string element', async () => {
      const result = await endpoint.call(
        endpoint.wrap({ ...endpoint.playlist, tags: ['valid', 1] }),
      );
      expect(endpoint.readPlaylist(result.body)).not.toHaveProperty('tags');
    });

    for (const location of ['creator', 'subscribers'] as const) {
      const withUser = (user: unknown) =>
        endpoint.wrap({
          ...endpoint.playlist,
          [location]: location === 'creator' ? user : [user],
        });
      const readUser = (body: unknown) => {
        const playlist = endpoint.readPlaylist(body);
        return location === 'creator'
          ? (playlist.creator as Record<string, unknown>)
          : (playlist.subscribers as Array<Record<string, unknown>>)[0]!;
      };

      test(`handles a null ${location} user`, async () => {
        const result = await endpoint.call(withUser(null));
        if (location === 'creator') {
          expect(endpoint.readPlaylist(result.body)[location]).toBeNull();
        } else {
          expect(endpoint.readPlaylist(result.body)).not.toHaveProperty(
            location,
          );
        }
      });

      test(`treats a ${location} user of the wrong type as absent`, async () => {
        const result = await endpoint.call(withUser([]));
        expect(endpoint.readPlaylist(result.body)).not.toHaveProperty(location);
      });

      test.each(userFields)(
        `treats a missing ${location}.%s as absent`,
        async (field) => {
          const result = await endpoint.call(
            withUser(without(endpoint.playlist.creator, field)),
          );
          expect(readUser(result.body)).not.toHaveProperty(field);
        },
      );

      test.each(userFields)(
        `treats ${location}.%s with the wrong type as absent`,
        async (field) => {
          const result = await endpoint.call(
            withUser({
              ...endpoint.playlist.creator,
              [field]: wrongUserValue(field),
            }),
          );
          expect(readUser(result.body)).not.toHaveProperty(field);
        },
      );

      test.each(userFields)(`keeps a null ${location}.%s`, async (field) => {
        const result = await endpoint.call(
          withUser({ ...endpoint.playlist.creator, [field]: null }),
        );
        const user = readUser(result.body);
        expect(user).not.toBeNull();
        expect(user[field]).toBeNull();
      });

      test(`drops a ${location}.expertTags list with a non-string element`, async () => {
        const result = await endpoint.call(
          withUser({
            ...endpoint.playlist.creator,
            expertTags: ['valid', 1],
          }),
        );
        expect(readUser(result.body)).not.toHaveProperty('expertTags');
      });
    }

    test('preserves undeclared fields at every object boundary', async () => {
      const user = {
        ...endpoint.playlist.creator,
        remarkName: { future: true },
        futureUserField: ['preserved'],
        avatarDetail: { future: { nested: [1, null, true] } },
        experts: { 1: '专家' },
        futureExperts: { future: ['preserved'] },
      };
      const body = {
        ...endpoint.wrap({
          ...endpoint.playlist,
          sharedUsers: { future: true },
          tracks:
            endpoint.module === 'user_playlist'
              ? null
              : [{ id: 1, future: true }],
          futurePlaylistField: ['preserved'],
          creator: user,
          subscribers: [user],
          ...(endpoint.module === 'playlist_detail'
            ? { trackIds: [{ id: 1, future: true }] }
            : {}),
        }),
        futureBodyField: { preserved: true },
      };
      expect((await endpoint.call(body)).body as unknown).toEqual(body);
      expect(endpoint.validator['~standard'].validate(body) as unknown).toEqual(
        { value: body },
      );
    });
  });
}

const trackIdsWrap = (playlist: object) => ({ code: 200, playlist });
const trackIdsCall = (body: unknown) =>
  replay(body).playlistDetail(detailOwn.query);

describe('playlist_detail track ids', () => {
  const playlist = detailOwn.response.body.playlist;

  test('rejects missing track ids', async () => {
    await expectUpstreamShapeRejection(
      trackIdsCall(trackIdsWrap(without(playlist, 'trackIds'))),
      {
        module: 'playlist_detail',
        path: 'body.playlist.trackIds',
        expected: 'present',
        actual: 'missing',
      },
    );
  });

  test('rejects track ids that are not an array', async () => {
    await expectUpstreamShapeRejection(
      trackIdsCall(trackIdsWrap({ ...playlist, trackIds: {} })),
      {
        module: 'playlist_detail',
        path: 'body.playlist.trackIds',
        expected: 'array',
        actual: 'object',
      },
    );
  });

  test('rejects a track id with the wrong type', async () => {
    await expectUpstreamShapeRejection(
      trackIdsCall(trackIdsWrap({ ...playlist, trackIds: [{ id: '1' }] })),
      {
        module: 'playlist_detail',
        path: 'body.playlist.trackIds[0].id',
        expected: 'number',
        actual: 'string',
      },
    );
  });
});

const fixtureRoot = join(
  import.meta.dir,
  '../fixtures/netease/playlist-summary',
);
const recordings = readdirSync(fixtureRoot, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((path) => /\.json(?:\.gz)?$/.test(path))
  .toSorted()
  .map((path) => {
    const bytes = readFileSync(join(fixtureRoot, path));
    const recording = JSON.parse(
      (path.endsWith('.gz') ? gunzipSync(bytes) : bytes).toString(),
    ) as Recording;
    return { path, recording };
  });

test('covers all 76 recordings specified by issue #89', () => {
  expect(
    recordings.filter(({ path }) => path.includes('user_playlist')),
  ).toHaveLength(7);
  expect(
    recordings.filter(({ path }) => path.includes('playlist_detail')),
  ).toHaveLength(69);
});

test.each(recordings)(
  'replays the committed recording $path',
  async ({ path, recording }) => {
    const body = recording.response.body as Record<string, unknown>;
    const isList = path.includes('user_playlist');
    const client = replay(body);
    const call = isList
      ? client.userPlaylist(
          recording.query as Parameters<typeof client.userPlaylist>[0],
        )
      : client.playlistDetail(
          recording.query as Parameters<typeof client.playlistDetail>[0],
        );
    const validator = isList ? UserPlaylistBody : PlaylistDetailBody;
    if (body.code === 200) {
      expect((await call).body as unknown).toEqual(body);
      expect(validator['~standard'].validate(body) as unknown).toEqual({
        value: body,
      });
    } else {
      expect((await settle<unknown>(call)) as unknown).toEqual({
        rejected: { status: body.code, body, cookie: [] },
      });
    }
  },
);

test('exports the common playlist and user types from the package root', () => {
  expectTypeOf<
    UserPlaylistBody['playlist'][number]
  >().toEqualTypeOf<PlaylistSummary>();
  expectTypeOf<PlaylistDetailBody['playlist']>().toExtend<PlaylistSummary>();
  expectTypeOf<PlaylistSummary['creator']>().toEqualTypeOf<
    PlaylistUser | null | undefined
  >();
  expectTypeOf<
    NonNullable<PlaylistSummary['subscribers']>[number]
  >().toEqualTypeOf<PlaylistUser>();
  expectTypeOf<PlaylistDetailBody['playlist']['creator']>().toEqualTypeOf<
    PlaylistUser | null | undefined
  >();
  expectTypeOf<
    NonNullable<PlaylistDetailBody['playlist']['subscribers']>[number]
  >().toEqualTypeOf<PlaylistUser>();
});
