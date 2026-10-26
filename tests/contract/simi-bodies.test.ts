import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  SimiArtistBody,
  SimiMvBody,
  SimiPlaylistBody,
  SimiSongBody,
  SimiUserBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay, replayRaw } from '../_kit/replay.ts';
import simiArtist from '../fixtures/netease/simi/simi_artist.default.json';
import simiArtistMissingId from '../fixtures/netease/simi/simi_artist.missing-id.json';
import simiArtistUnknown from '../fixtures/netease/simi/simi_artist.unknown.json';
import simiMv from '../fixtures/netease/simi/simi_mv.default.json';
import simiMvUnknownMvid from '../fixtures/netease/simi/simi_mv.unknown-mvid.json';
import simiPlaylist from '../fixtures/netease/simi/simi_playlist.default.json';
import simiPlaylistMissingId from '../fixtures/netease/simi/simi_playlist.missing-id.json';
import simiPlaylistUnknown from '../fixtures/netease/simi/simi_playlist.unknown.json';
import simiSong from '../fixtures/netease/simi/simi_song.default.json';
import simiSongMissingId from '../fixtures/netease/simi/simi_song.missing-id.json';
import simiSongUnknown from '../fixtures/netease/simi/simi_song.unknown.json';
import simiUserEmpty from '../fixtures/netease/simi/simi_user.empty.json';
import simiUserMissingId from '../fixtures/netease/simi/simi_user.missing-id.json';

// issue #102 B30 的录制来自本机登录账号（context.viewer 是 authenticated），
// 录制前用 login_status 确认 anonimousUser: false。五个模块的列表在所有成功录制里都出现，
// 空结果是空数组，没有“可以没有”的路径。
type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'simi_artist returns the recorded similar artists',
    recording: simiArtist,
    bodySchema: SimiArtistBody,
    call: (upstream, status) =>
      replay(upstream, status).simiArtist({ id: simiArtist.query.id }),
  },
  {
    name: 'simi_artist returns an empty list for an unknown artist',
    recording: simiArtistUnknown,
    bodySchema: SimiArtistBody,
    call: (upstream, status) =>
      replay(upstream, status).simiArtist({ id: simiArtistUnknown.query.id }),
  },
  {
    name: 'simi_mv returns the recorded similar MVs',
    recording: simiMv,
    bodySchema: SimiMvBody,
    call: (upstream, status) =>
      replay(upstream, status).simiMv({ mvid: simiMv.query.mvid }),
  },
  {
    name: 'simi_mv returns the default list for an unknown mvid',
    recording: simiMvUnknownMvid,
    bodySchema: SimiMvBody,
    call: (upstream, status) =>
      replay(upstream, status).simiMv({ mvid: simiMvUnknownMvid.query.mvid }),
  },
  {
    name: 'simi_playlist returns the recorded similar playlists',
    recording: simiPlaylist,
    bodySchema: SimiPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).simiPlaylist({ id: simiPlaylist.query.id }),
  },
  {
    name: 'simi_playlist returns an empty list for an unknown song',
    recording: simiPlaylistUnknown,
    bodySchema: SimiPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).simiPlaylist({
        id: simiPlaylistUnknown.query.id,
      }),
  },
  {
    name: 'simi_song returns the recorded similar songs',
    recording: simiSong,
    bodySchema: SimiSongBody,
    call: (upstream, status) =>
      replay(upstream, status).simiSong({ id: simiSong.query.id }),
  },
  {
    name: 'simi_song returns an empty list for an unknown song',
    recording: simiSongUnknown,
    bodySchema: SimiSongBody,
    call: (upstream, status) =>
      replay(upstream, status).simiSong({ id: simiSongUnknown.query.id }),
  },
  {
    name: 'simi_user returns the recorded empty similar users',
    recording: simiUserEmpty,
    bodySchema: SimiUserBody,
    call: (upstream, status) =>
      replay(upstream, status).simiUser({ id: simiUserEmpty.query.id }),
  },
];

test.each(cases)('$name', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test('simi bodies tighten the returned record ids', () => {
  type SimiPlaylistObject = Extract<SimiPlaylistBody, { code: 200 }>;
  type SimiUserObject = Extract<SimiUserBody, { code: 200 }>;
  expectTypeOf<
    SimiArtistBody['artists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<SimiArtistBody['artists'][number]['musicSize']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<SimiMvBody['mvs'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<SimiMvBody['mvs'][number]['playCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    SimiPlaylistObject['playlists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    SimiPlaylistObject['playlists'][number]['subscribed']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<SimiSongBody['songs'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<SimiSongBody['songs'][number]['name']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<SimiSongBody['songs'][number]['transNames']>().toEqualTypeOf<
    ReadonlyArray<string> | null | undefined
  >();
  expectTypeOf<SimiUserObject['code']>().toEqualTypeOf<200>();
  expectTypeOf<Extract<SimiPlaylistBody, string>>().toEqualTypeOf<''>();
  expectTypeOf<Extract<SimiUserBody, string>>().toEqualTypeOf<''>();
});

test('simi_artist rejects a list without the returned artists', async () => {
  const upstream = structuredClone(simiArtist.response.body) as {
    artists?: unknown;
  };
  delete upstream.artists;

  await expectUpstreamShapeRejection(
    replay(upstream).simiArtist({ id: simiArtist.query.id }),
    {
      module: 'simi_artist',
      path: 'body.artists',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_artist rejects an artist without an id', async () => {
  const upstream = structuredClone(simiArtist.response.body) as {
    artists: Array<{ id?: number }>;
  };
  delete upstream.artists[0]?.id;

  await expectUpstreamShapeRejection(
    replay(upstream).simiArtist({ id: simiArtist.query.id }),
    {
      module: 'simi_artist',
      path: 'body.artists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_mv rejects a list without the returned MVs', async () => {
  const upstream = structuredClone(simiMv.response.body) as {
    mvs?: unknown;
  };
  delete upstream.mvs;

  await expectUpstreamShapeRejection(
    replay(upstream).simiMv({ mvid: simiMv.query.mvid }),
    {
      module: 'simi_mv',
      path: 'body.mvs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_mv rejects an MV whose id is text', async () => {
  const upstream = structuredClone(simiMv.response.body) as {
    mvs: Array<{ id: unknown }>;
  };
  upstream.mvs[0]!.id = '142002';

  await expectUpstreamShapeRejection(
    replay(upstream).simiMv({ mvid: simiMv.query.mvid }),
    {
      module: 'simi_mv',
      path: 'body.mvs[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('simi_playlist rejects a list without the returned playlists', async () => {
  const upstream = structuredClone(simiPlaylist.response.body) as {
    playlists?: unknown;
  };
  delete upstream.playlists;

  await expectUpstreamShapeRejection(
    replay(upstream).simiPlaylist({ id: simiPlaylist.query.id }),
    {
      module: 'simi_playlist',
      path: 'body.playlists',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_playlist rejects a playlist without an id', async () => {
  const upstream = structuredClone(simiPlaylist.response.body) as {
    playlists: Array<{ id?: number }>;
  };
  delete upstream.playlists[0]?.id;

  await expectUpstreamShapeRejection(
    replay(upstream).simiPlaylist({ id: simiPlaylist.query.id }),
    {
      module: 'simi_playlist',
      path: 'body.playlists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_song rejects a list without the returned songs', async () => {
  const upstream = structuredClone(simiSong.response.body) as {
    songs?: unknown;
  };
  delete upstream.songs;

  await expectUpstreamShapeRejection(
    replay(upstream).simiSong({ id: simiSong.query.id }),
    {
      module: 'simi_song',
      path: 'body.songs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_song rejects a song without an id', async () => {
  const upstream = structuredClone(simiSong.response.body) as {
    songs: Array<{ id?: number }>;
  };
  delete upstream.songs[0]?.id;

  await expectUpstreamShapeRejection(
    replay(upstream).simiSong({ id: simiSong.query.id }),
    {
      module: 'simi_song',
      path: 'body.songs[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('simi_user rejects a body without a return code', async () => {
  const upstream = structuredClone(simiUserEmpty.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).simiUser({ id: simiUserEmpty.query.id }),
    {
      module: 'simi_user',
      path: 'body',
      expected: 'object with code 200 or an empty string',
      actual: 'object',
    },
  );
});

test('simi_artist drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(simiArtist.response.body) as {
    artists: Array<
      Record<string, unknown> & {
        accountId?: unknown;
        albumSize: unknown;
        name: unknown;
      }
    >;
  };
  const artist = upstream.artists[0]!;
  delete artist.musicSize;
  artist.name = null;
  artist.albumSize = '133';
  artist.identifyTag = { kind: 'seed' };

  const result = await replay(upstream).simiArtist({
    id: simiArtist.query.id,
  });
  const returned = result.body.artists[0]!;

  expect(returned).not.toHaveProperty('musicSize');
  expect(returned).not.toHaveProperty('albumSize');
  expect(returned.name as unknown).toBeNull();
  expect(returned as unknown).toHaveProperty('identifyTag', { kind: 'seed' });
});

test('simi_mv drops a bad loose counter and keeps undeclared fields', async () => {
  const upstream = structuredClone(simiMv.response.body) as {
    mvs: Array<Record<string, unknown> & { playCount: unknown }>;
  };
  const mv = upstream.mvs[0]!;
  delete mv.cover;
  mv.playCount = '515507';
  mv.duration = null;
  mv.desc = 'custom-desc';

  const result = await replay(upstream).simiMv({ mvid: simiMv.query.mvid });
  const returned = result.body.mvs[0]!;

  expect(returned).not.toHaveProperty('cover');
  expect(returned).not.toHaveProperty('playCount');
  expect(returned.duration as unknown).toBeNull();
  expect(returned as unknown).toHaveProperty('desc', 'custom-desc');
});

test('simi_playlist drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(simiPlaylist.response.body) as {
    playlists: Array<
      Record<string, unknown> & { subscribed: unknown; creator: unknown }
    >;
  };
  const playlist = upstream.playlists[0]!;
  playlist.subscribed = 'false';
  delete playlist.trackCount;
  playlist.creator = null;
  playlist.title = 'custom-title';

  const result = await replay(upstream).simiPlaylist({
    id: simiPlaylist.query.id,
  });
  const returned = (result.body as Extract<SimiPlaylistBody, { code: 200 }>)
    .playlists[0]!;

  expect(returned).not.toHaveProperty('subscribed');
  expect(returned).not.toHaveProperty('trackCount');
  expect(returned.creator as unknown).toBeNull();
  expect(returned as unknown).toHaveProperty('title', 'custom-title');
});

test('simi_song drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(simiSong.response.body) as {
    songs: Array<Record<string, unknown> & { name: unknown }>;
  };
  const song = upstream.songs[0]!;
  song.name = 123;
  delete song.dt;
  song.ar = null;
  song.rtUrl = '//custom-rt-url';

  const result = await replay(upstream).simiSong({ id: simiSong.query.id });
  const returned = result.body.songs[0]!;

  expect(returned).not.toHaveProperty('name');
  expect(returned).not.toHaveProperty('dt');
  expect(returned.ar as unknown).toBeNull();
  expect(returned as unknown).toHaveProperty('rtUrl', '//custom-rt-url');
});

test('simi_user keeps the undeclared user list untouched', async () => {
  const upstream = {
    code: 200,
    userprofiles: [{ userId: 1, nickname: 'listener' }],
  };

  const result = await replay(upstream).simiUser({ id: 108485 });

  expect(result.body as unknown).toEqual(upstream);
});

test('simi_artist rejects a business error with the original body', async () => {
  expect(
    await settle(
      replay(
        simiArtistMissingId.response.body,
        simiArtistMissingId.response.status,
      ).simiArtist({}),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: simiArtistMissingId.response.body,
    },
  });
});

test('simi_song rejects a business error with the original body', async () => {
  expect(
    await settle(
      replay(
        simiSongMissingId.response.body,
        simiSongMissingId.response.status,
      ).simiSong({}),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: simiSongMissingId.response.body,
    },
  });
});

test.each([
  {
    name: 'simi_playlist',
    recording: simiPlaylistMissingId,
    bodySchema: SimiPlaylistBody,
    call: (body: string, status: number) =>
      replayRaw(body, status).simiPlaylist({}),
  },
  {
    name: 'simi_user',
    recording: simiUserMissingId,
    bodySchema: SimiUserBody,
    call: (body: string, status: number) =>
      replayRaw(body, status).simiUser({}),
  },
])(
  '$name keeps the normalized empty HTTP 400 body',
  async ({ recording, bodySchema, call }) => {
    const result = await settle(
      call(recording.response.body, recording.response.status),
    );

    expect(result).toEqual({
      resolved: { status: 200, cookie: [], body: '' },
    });
    const validated = validateSync(bodySchema, recording.response.body);
    expect(validated.issues).toBeUndefined();
    expect(validated.value).toBe('');
  },
);

test('simi_song rejects a malformed recording locally without another upstream request', async () => {
  let requests = 0;
  const upstream = structuredClone(simiSong.response.body) as {
    songs: Array<{ id?: number }>;
  };
  delete upstream.songs[0]?.id;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(upstream);
    },
  });

  await expectUpstreamShapeRejection(api.simiSong({ id: simiSong.query.id }), {
    module: 'simi_song',
    path: 'body.songs[0].id',
    expected: 'present',
    actual: 'missing',
  });
  expect(requests).toBe(1);
});
