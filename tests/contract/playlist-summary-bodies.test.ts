import { describe, expect, expectTypeOf, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

import {
  createHanaMusicApi,
  PlaylistDetailBody,
  UserPlaylistBody,
} from '../../index.ts';
import type { PlaylistSummary, PlaylistUser } from '../../index.ts';
import type { Recording } from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection, settle } from '../_kit/assertions.ts';
import detailOwn from '../fixtures/netease/library/playlist_detail.own-small.json';
import userPlaylist from '../fixtures/netease/library/user_playlist.json';

const replay = (body: unknown) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(body),
  });

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
  },
  {
    module: 'playlist_detail',
    path: 'body.playlist',
    playlist: detailOwn.response.body.playlist,
    wrap: (playlist: object) => ({ code: 200, playlist }),
    call: (body: unknown) => replay(body).playlistDetail(detailOwn.query),
    validator: PlaylistDetailBody,
  },
];

const requiredPlaylistFields = [
  'id',
  'trackCount',
  'updateTime',
  'trackUpdateTime',
  'playCount',
  'privacy',
  'specialType',
  'status',
  'name',
  'coverImgUrl',
  'description',
  'tags',
  'subscribed',
  'creator',
];
const playlistNumbers = [
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
const playlistNullableStrings = [
  'backgroundCoverUrl',
  'coverImgId_str',
  'englishTitle',
  'titleImageUrl',
  'updateFrequency',
];
const playlistBooleans = [
  'copied',
  'highQuality',
  'mix',
  'newImported',
  'opRecommend',
  'ordered',
];
const userNumbers = [
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
const userStrings = [
  'avatarImgIdStr',
  'avatarImgId_str',
  'avatarUrl',
  'description',
  'detailDescription',
  'signature',
  'backgroundImgIdStr',
];
const userBooleans = ['anchor', 'defaultAvatar', 'followed', 'mutual'];

for (const endpoint of endpoints) {
  describe(endpoint.module, () => {
    test.each(requiredPlaylistFields)(
      'rejects missing playlist.%s',
      async (field) => {
        const playlist: Record<string, unknown> = { ...endpoint.playlist };
        delete playlist[field];
        await expectUpstreamShapeRejection(
          endpoint.call(endpoint.wrap(playlist)),
          {
            module: endpoint.module,
            path: `${endpoint.path}.${field}`,
            expected: 'present',
            actual: 'missing',
          },
        );
      },
    );

    test.each([
      ...[
        'id',
        'trackCount',
        'updateTime',
        'trackUpdateTime',
        'playCount',
        'privacy',
        'specialType',
        'status',
        ...playlistNumbers,
      ].map((field) => ({
        field,
        value: '1',
        expected: 'number',
        actual: 'string',
      })),
      ...['name', 'coverImgUrl', 'commentThreadId'].map((field) => ({
        field,
        value: false,
        expected: 'string',
        actual: 'boolean',
      })),
      ...['description', ...playlistNullableStrings].map((field) => ({
        field,
        value: 1,
        expected: 'string | null',
        actual: 'number',
      })),
      ...playlistBooleans.map((field) => ({
        field,
        value: 1,
        expected: 'boolean',
        actual: 'number',
      })),
      {
        field: 'subscribed',
        value: 1,
        expected: 'boolean | null',
        actual: 'number',
      },
      { field: 'creator', value: [], expected: 'object', actual: 'array' },
      { field: 'tags', value: null, expected: 'array', actual: 'null' },
      { field: 'subscribers', value: null, expected: 'array', actual: 'null' },
    ])(
      'rejects invalid playlist.$field',
      async ({ field, value, expected, actual }) => {
        const body = endpoint.wrap({ ...endpoint.playlist, [field]: value });
        await expectUpstreamShapeRejection(endpoint.call(body), {
          module: endpoint.module,
          path: `${endpoint.path}.${field}`,
          expected,
          actual,
        });
      },
    );

    test('rejects tags with non-string elements', async () => {
      await expectUpstreamShapeRejection(
        endpoint.call(
          endpoint.wrap({
            ...endpoint.playlist,
            tags: ['valid', 1],
          }),
        ),
        {
          module: endpoint.module,
          path: `${endpoint.path}.tags[1]`,
          expected: 'string',
          actual: 'number',
        },
      );
    });

    test('accepts absent optional fields in playlists and users', async () => {
      const playlist = {
        ...Object.fromEntries(
          requiredPlaylistFields.map((field) => [
            field,
            (endpoint.playlist as Record<string, unknown>)[field],
          ]),
        ),
        creator: { userId: 1, nickname: 'listener' },
        ...(endpoint.module === 'playlist_detail' ? { trackIds: [] } : {}),
      };
      const body = endpoint.wrap(playlist);
      expect((await endpoint.call(body)).body as unknown).toEqual(body);
      expect(endpoint.validator['~standard'].validate(body) as unknown).toEqual(
        { value: body },
      );
      const withSubscribers = endpoint.wrap({
        ...playlist,
        subscribers: [{ userId: 2, nickname: 'subscriber' }],
      });
      expect((await endpoint.call(withSubscribers)).body as unknown).toEqual(
        withSubscribers,
      );
    });

    test.each([null, 'present'])(
      'accepts nullable playlist strings: %s',
      async (value) => {
        const body = endpoint.wrap({
          ...endpoint.playlist,
          ...Object.fromEntries(
            ['description', ...playlistNullableStrings].map((field) => [
              field,
              value,
            ]),
          ),
          subscribed: null,
        });
        expect((await endpoint.call(body)).body as unknown).toEqual(body);
      },
    );

    for (const location of ['creator', 'subscribers'] as const) {
      const withUser = (user: unknown) =>
        endpoint.wrap({
          ...endpoint.playlist,
          [location]: location === 'creator' ? user : [user],
        });
      const path = `${endpoint.path}.${location === 'creator' ? location : 'subscribers[0]'}`;

      test.each(['userId', 'nickname'])(
        `rejects missing ${location}.%s`,
        async (field) => {
          const user: Record<string, unknown> = {
            ...endpoint.playlist.creator,
          };
          delete user[field];
          await expectUpstreamShapeRejection(endpoint.call(withUser(user)), {
            module: endpoint.module,
            path: `${path}.${field}`,
            expected: 'present',
            actual: 'missing',
          });
        },
      );

      test.each([
        ...['userId', ...userNumbers].map((field) => ({
          field,
          value: '1',
          expected: 'number',
          actual: 'string',
        })),
        ...['nickname', ...userStrings].map((field) => ({
          field,
          value: false,
          expected: 'string',
          actual: 'boolean',
        })),
        ...userBooleans.map((field) => ({
          field,
          value: 1,
          expected: 'boolean',
          actual: 'number',
        })),
        {
          field: 'backgroundUrl',
          value: 1,
          expected: 'string | null',
          actual: 'number',
        },
        {
          field: 'expertTags',
          value: false,
          expected: 'array | null',
          actual: 'boolean',
        },
        {
          field: 'avatarDetail',
          value: [],
          expected: 'object | null',
          actual: 'array',
        },
        {
          field: 'experts',
          value: [],
          expected: 'object | null',
          actual: 'array',
        },
      ])(
        `rejects invalid ${location}.$field`,
        async ({ field, value, expected, actual }) => {
          await expectUpstreamShapeRejection(
            endpoint.call(
              withUser({
                ...endpoint.playlist.creator,
                [field]: value,
              }),
            ),
            {
              module: endpoint.module,
              path: `${path}.${field}`,
              expected,
              actual,
            },
          );
        },
      );

      test(`rejects a null ${location} user`, async () => {
        await expectUpstreamShapeRejection(endpoint.call(withUser(null)), {
          module: endpoint.module,
          path,
          expected: 'object',
          actual: 'null',
        });
      });

      test(`rejects a non-string ${location}.expertTags element`, async () => {
        await expectUpstreamShapeRejection(
          endpoint.call(
            withUser({
              ...endpoint.playlist.creator,
              expertTags: ['valid', 1],
            }),
          ),
          {
            module: endpoint.module,
            path: `${path}.expertTags[1]`,
            expected: 'string',
            actual: 'number',
          },
        );
      });

      test.each([null, 'present'])(
        `accepts nullable ${location} fields: %s`,
        async (value) => {
          const body = withUser({
            ...endpoint.playlist.creator,
            backgroundUrl: value,
            expertTags: value === null ? null : [value],
            avatarDetail:
              value === null ? null : { nested: { future: [1, null, true] } },
            experts: value === null ? null : { category: 'music' },
          });
          expect((await endpoint.call(body)).body as unknown).toEqual(body);
        },
      );
    }

    test('preserves undeclared fields at every object boundary', async () => {
      const user = {
        ...endpoint.playlist.creator,
        remarkName: { future: true },
        futureUserField: ['preserved'],
        avatarDetail: { future: { nested: [1, null, true] } },
        experts: { future: ['preserved'] },
      };
      const body = {
        ...endpoint.wrap({
          ...endpoint.playlist,
          sharedUsers: { future: true },
          tracks:
            endpoint.module === 'user_playlist' ? null : [{ future: true }],
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
  expectTypeOf<PlaylistSummary['creator']>().toEqualTypeOf<PlaylistUser>();
  expectTypeOf<
    NonNullable<PlaylistSummary['subscribers']>[number]
  >().toEqualTypeOf<PlaylistUser>();
  expectTypeOf<
    PlaylistDetailBody['playlist']['creator']
  >().toEqualTypeOf<PlaylistUser>();
  expectTypeOf<
    NonNullable<PlaylistDetailBody['playlist']['subscribers']>[number]
  >().toEqualTypeOf<PlaylistUser>();
});
