import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  StyleAlbumBody,
  StyleArtistBody,
  StyleDetailBody,
  StyleListBody,
  StylePlaylistBody,
  StyleSongBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import styleAlbum from '../fixtures/netease/style/style_album.default.json';
import styleAlbumMissingTag from '../fixtures/netease/style/style_album.missing-tag.json';
import styleAlbumEmpty from '../fixtures/netease/style/style_album.unknown-tag.json';
import styleArtist from '../fixtures/netease/style/style_artist.default.json';
import styleArtistMissingTag from '../fixtures/netease/style/style_artist.missing-tag.json';
import styleArtistEmpty from '../fixtures/netease/style/style_artist.unknown-tag.json';
import styleDetailAnonymous from '../fixtures/netease/style/style_detail.anonymous.json';
import styleDetail from '../fixtures/netease/style/style_detail.default.json';
import styleDetailMissingTag from '../fixtures/netease/style/style_detail.missing-tag.json';
import styleDetailUnknown from '../fixtures/netease/style/style_detail.unknown-tag.json';
import styleList from '../fixtures/netease/style/style_list.default.json';
import stylePlaylist from '../fixtures/netease/style/style_playlist.default.json';
import stylePlaylistMissingTag from '../fixtures/netease/style/style_playlist.missing-tag.json';
import stylePlaylistEmpty from '../fixtures/netease/style/style_playlist.unknown-tag.json';
import styleSongAnonymous from '../fixtures/netease/style/style_song.anonymous.json';
import styleSong from '../fixtures/netease/style/style_song.default.json';
import styleSongMissingTag from '../fixtures/netease/style/style_song.missing-tag.json';
import styleSongEmpty from '../fixtures/netease/style/style_song.unknown-tag.json';

// issue #102 B29 的登录、匿名与未知曲风 id 录制；差异见各录制的 context。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ status: number; body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'style_list',
    recording: styleList,
    bodySchema: StyleListBody,
    call: (upstream, status) =>
      replay(upstream, status).styleList(styleList.query),
  },
  {
    name: 'style_detail',
    recording: styleDetail,
    bodySchema: StyleDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).styleDetail(styleDetail.query),
  },
  {
    name: 'style_detail for an anonymous listener',
    recording: styleDetailAnonymous,
    bodySchema: StyleDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).styleDetail(styleDetailAnonymous.query),
  },
  {
    name: 'style_detail for an unknown style id',
    recording: styleDetailUnknown,
    bodySchema: StyleDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).styleDetail(styleDetailUnknown.query),
  },
  {
    name: 'style_artist',
    recording: styleArtist,
    bodySchema: StyleArtistBody,
    call: (upstream, status) =>
      replay(upstream, status).styleArtist(styleArtist.query),
  },
  {
    name: 'style_artist for an unknown style id',
    recording: styleArtistEmpty,
    bodySchema: StyleArtistBody,
    call: (upstream, status) =>
      replay(upstream, status).styleArtist(styleArtistEmpty.query),
  },
  {
    name: 'style_album',
    recording: styleAlbum,
    bodySchema: StyleAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).styleAlbum(styleAlbum.query),
  },
  {
    name: 'style_album for an unknown style id',
    recording: styleAlbumEmpty,
    bodySchema: StyleAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).styleAlbum(styleAlbumEmpty.query),
  },
  {
    name: 'style_playlist',
    recording: stylePlaylist,
    bodySchema: StylePlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).stylePlaylist(stylePlaylist.query),
  },
  {
    name: 'style_playlist for an unknown style id',
    recording: stylePlaylistEmpty,
    bodySchema: StylePlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).stylePlaylist(stylePlaylistEmpty.query),
  },
  {
    name: 'style_song',
    recording: styleSong,
    bodySchema: StyleSongBody,
    call: (upstream, status) =>
      replay(upstream, status).styleSong(styleSong.query),
  },
  {
    name: 'style_song for an anonymous listener',
    recording: styleSongAnonymous,
    bodySchema: StyleSongBody,
    call: (upstream, status) =>
      replay(upstream, status).styleSong(styleSongAnonymous.query),
  },
  {
    name: 'style_song for an unknown style id',
    recording: styleSongEmpty,
    bodySchema: StyleSongBody,
    call: (upstream, status) =>
      replay(upstream, status).styleSong(styleSongEmpty.query),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(entry.recording.response.status);
  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'style_detail',
    recording: styleDetailMissingTag,
    call: (upstream, status) =>
      replay(upstream, status).styleDetail(styleDetailMissingTag.query),
  },
  {
    name: 'style_artist',
    recording: styleArtistMissingTag,
    call: (upstream, status) =>
      replay(upstream, status).styleArtist(styleArtistMissingTag.query),
  },
  {
    name: 'style_album',
    recording: styleAlbumMissingTag,
    call: (upstream, status) =>
      replay(upstream, status).styleAlbum(styleAlbumMissingTag.query),
  },
  {
    name: 'style_playlist',
    recording: stylePlaylistMissingTag,
    call: (upstream, status) =>
      replay(upstream, status).stylePlaylist(stylePlaylistMissingTag.query),
  },
  {
    name: 'style_song',
    recording: styleSongMissingTag,
    call: (upstream, status) =>
      replay(upstream, status).styleSong(styleSongMissingTag.query),
  },
])('$name passes a rejected code through', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('style bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    StyleListBody['data'][number]['tagId']
  >().toEqualTypeOf<number>();
  expectTypeOf<StyleListBody['data'][number]['tagName']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    NonNullable<StyleDetailBody['data']>['tagId']
  >().toEqualTypeOf<number>();
  expectTypeOf<null>().toExtend<StyleDetailBody['data']>();
  expectTypeOf<undefined>().toExtend<StyleDetailBody['data']>();
  expectTypeOf<
    StyleArtistBody['data']['artists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    StyleArtistBody['data']['artists'][number]['fansCount']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    StyleAlbumBody['data']['albums'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<StyleAlbumBody['data']['page']>['total']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    StylePlaylistBody['data']['playlist'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    StyleSongBody['data']['songs'][number]['id']
  >().toEqualTypeOf<number>();
});

test('style_list rejects a style list that is not an array', async () => {
  const upstream = structuredClone(styleList.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).styleList(styleList.query),
    {
      module: 'style_list',
      path: 'body.data',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('style_list rejects a top-level style whose tagId is text', async () => {
  const upstream = structuredClone(styleList.response.body);
  (upstream.data[0] as { tagId: unknown }).tagId = '1000';

  await expectUpstreamShapeRejection(
    replay(upstream).styleList(styleList.query),
    {
      module: 'style_list',
      path: 'body.data[0].tagId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('style_list drops bad child tags and keeps undeclared fields', async () => {
  const upstream = structuredClone(styleList.response.body);
  const first = upstream.data[0] as {
    childrenTags: Array<{
      tagId?: unknown;
      tagName: unknown;
      extraTag?: unknown;
    }>;
    extraTag?: unknown;
  };
  const child = first.childrenTags[0]!;
  child.tagId = '1020';
  child.tagName = 1020;
  child.extraTag = { keep: true };
  first.extraTag = 'keep';

  const result = await replay(upstream).styleList(styleList.query);
  const decoded = result.body as unknown as {
    data: Array<{
      childrenTags: Array<Record<string, unknown>>;
      extraTag?: unknown;
    }>;
  };
  const decodedChild = decoded.data[0]!.childrenTags[0]!;

  expect(decoded.data[0]).toHaveProperty('extraTag', 'keep');
  expect(decodedChild).not.toHaveProperty('tagId');
  expect(decodedChild).not.toHaveProperty('tagName');
  expect(decodedChild).toHaveProperty('extraTag', { keep: true });
  expect(decodedChild.picUrl).toBe(
    (styleList.response.body.data[0]!.childrenTags[0] as { picUrl: string })
      .picUrl,
  );
});

test('style_list returns a recorded empty style list unchanged', async () => {
  const upstream = structuredClone(styleList.response.body) as {
    data: unknown;
  };
  upstream.data = [];

  const result = await replay(upstream).styleList(styleList.query);

  expect(result.status).toBe(200);
  expect(result.body.data as unknown).toEqual([]);
});

test('style_detail rejects a style whose tagId is text', async () => {
  const upstream = structuredClone(styleDetail.response.body);
  (upstream.data as { tagId: unknown }).tagId = '1000';

  await expectUpstreamShapeRejection(
    replay(upstream).styleDetail(styleDetail.query),
    {
      module: 'style_detail',
      path: 'body.data.tagId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('style_detail returns a style without details when data is missing', async () => {
  const upstream = structuredClone(styleDetail.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  const result = await replay(upstream).styleDetail(styleDetail.query);

  expect(result.status).toBe(200);
  expect(result.body as unknown).toEqual({ code: 200 });
});

test('style_detail drops bad favourite content and keeps undeclared fields', async () => {
  const upstream = structuredClone(styleDetail.response.body) as {
    data: {
      favouriteSong: unknown;
      professionalReviews: unknown;
      tagPortrait: { pattern: unknown };
      playRate?: unknown;
      name: unknown;
      extraTag?: unknown;
    };
  };
  upstream.data.favouriteSong = 'What Are Words';
  upstream.data.professionalReviews = [];
  upstream.data.tagPortrait.pattern = 'none';
  upstream.data.playRate = 0.3;
  upstream.data.extraTag = { keep: true };

  const result = await replay(upstream).styleDetail(styleDetail.query);
  const decoded = result.body as unknown as {
    data: Record<string, unknown> & { tagPortrait: Record<string, unknown> };
  };

  expect(decoded.data).not.toHaveProperty('favouriteSong');
  expect(decoded.data).not.toHaveProperty('professionalReviews');
  expect(decoded.data.tagPortrait).not.toHaveProperty('pattern');
  expect(decoded.data).toHaveProperty('playRate', 0.3);
  expect(decoded.data).toHaveProperty('extraTag', { keep: true });
  expect(decoded.data.name).toBe(styleDetail.response.body.data.name);
});

test('style_detail keeps a favourite song that is missing a declared field', async () => {
  const upstream = structuredClone(styleDetail.response.body);
  const song = upstream.data.favouriteSong.favouriteSong as {
    name?: unknown;
    privilege?: unknown;
  };
  delete song.name;
  delete song.privilege;

  const result = await replay(upstream).styleDetail(styleDetail.query);
  const decoded = result.body as unknown as {
    data?: { favouriteSong?: { favouriteSong?: Record<string, unknown> } };
  };
  const favourite = decoded.data?.favouriteSong?.favouriteSong;

  expect(result.status).toBe(200);
  expect(favourite).toBeDefined();
  expect(favourite).not.toHaveProperty('name');
  expect(favourite).not.toHaveProperty('privilege');
  expect(favourite?.id).toBe(
    styleDetail.response.body.data.favouriteSong.favouriteSong.id,
  );
});

test('style_artist rejects an artist without an id', async () => {
  const upstream = structuredClone(styleArtist.response.body);
  delete (upstream.data.artists[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).styleArtist(styleArtist.query),
    {
      module: 'style_artist',
      path: 'body.data.artists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('style_artist drops a bad fans count and keeps undeclared fields', async () => {
  const upstream = structuredClone(styleArtist.response.body);
  const first = upstream.data.artists[0] as {
    fansCount: unknown;
    awardTags?: unknown;
    name: unknown;
  };
  first.fansCount = 'many';
  first.awardTags = [{ tagName: '最佳男歌手' }];

  const result = await replay(upstream).styleArtist(styleArtist.query);
  const decoded = result.body.data.artists[0] as unknown as Record<
    string,
    unknown
  >;

  expect(decoded).not.toHaveProperty('fansCount');
  expect(decoded).toHaveProperty('awardTags', [{ tagName: '最佳男歌手' }]);
  expect(decoded.name).toBe(styleArtist.response.body.data.artists[0]?.name);
});

test('style_artist returns an empty page for an unknown style id', async () => {
  const result = await replay(
    styleArtistEmpty.response.body,
    styleArtistEmpty.response.status,
  ).styleArtist(styleArtistEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.data.artists as unknown).toEqual([]);
  expect(result.body.data.page?.more).toBe(false);
});

test('style_artist drops a page that is not an object', async () => {
  const upstream = structuredClone(styleArtist.response.body) as {
    data: { page: unknown };
  };
  upstream.data.page = [];

  const result = await replay(upstream).styleArtist(styleArtist.query);

  expect(result.status).toBe(200);
  expect(result.body.data).not.toHaveProperty('page');
  expect(result.body.data.artists).toHaveLength(
    styleArtist.response.body.data.artists.length,
  );
});

test('style_album rejects an album whose id is text', async () => {
  const upstream = structuredClone(styleAlbum.response.body);
  (upstream.data.albums[0] as { id: unknown }).id = '28539';

  await expectUpstreamShapeRejection(
    replay(upstream).styleAlbum(styleAlbum.query),
    {
      module: 'style_album',
      path: 'body.data.albums[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('style_album drops a bad album name and keeps undeclared songs', async () => {
  const upstream = structuredClone(styleAlbum.response.body);
  const first = upstream.data.albums[0] as {
    name: unknown;
    songs?: unknown;
  };
  first.name = 28539;
  first.songs = [{ id: 1 }];

  const result = await replay(upstream).styleAlbum(styleAlbum.query);
  const decoded = result.body.data.albums[0] as unknown as Record<
    string,
    unknown
  >;

  expect(decoded).not.toHaveProperty('name');
  expect(decoded).toHaveProperty('songs', [{ id: 1 }]);
});

test('style_playlist rejects a playlist without an id', async () => {
  const upstream = structuredClone(stylePlaylist.response.body);
  delete (upstream.data.playlist[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).stylePlaylist(stylePlaylist.query),
    {
      module: 'style_playlist',
      path: 'body.data.playlist[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('style_playlist drops a bad play count and keeps undeclared fields', async () => {
  const upstream = structuredClone(stylePlaylist.response.body);
  const first = upstream.data.playlist[0] as {
    playCount: unknown;
    createTime?: unknown;
    name: unknown;
  };
  first.playCount = '10091008';
  first.createTime = 1_714_000_000_000;

  const result = await replay(upstream).stylePlaylist(stylePlaylist.query);
  const decoded = result.body.data.playlist[0] as unknown as Record<
    string,
    unknown
  >;

  expect(decoded).not.toHaveProperty('playCount');
  expect(decoded).toHaveProperty('createTime', 1_714_000_000_000);
  expect(decoded.name).toBe(stylePlaylist.response.body.data.playlist[0]?.name);
});

test('style_song rejects a song whose id is text', async () => {
  const upstream = structuredClone(styleSong.response.body);
  (upstream.data.songs[0] as { id: unknown }).id = '287398';

  await expectUpstreamShapeRejection(
    replay(upstream).styleSong(styleSong.query),
    {
      module: 'style_song',
      path: 'body.data.songs[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('style_song drops bad song fields and keeps a loose page and unknown fields', async () => {
  const upstream = structuredClone(styleSong.response.body) as {
    data: {
      page?: unknown;
      songs: Array<{
        name: unknown;
        privilege: { flag: unknown; extraRight?: unknown };
        extraSongField?: unknown;
      }>;
    };
  };
  delete upstream.data.page;
  const first = upstream.data.songs[0]!;
  first.name = 287398;
  first.privilege.flag = 'full';
  first.privilege.extraRight = { keep: true };
  first.extraSongField = [1];

  const result = await replay(upstream).styleSong(styleSong.query);
  const decoded = result.body as unknown as {
    data: {
      page?: unknown;
      songs: Array<Record<string, unknown> & { privilege: unknown }>;
    };
  };
  const song = decoded.data.songs[0]!;

  expect(decoded.data).not.toHaveProperty('page');
  expect(song).not.toHaveProperty('name');
  expect(song).toHaveProperty('extraSongField', [1]);
  expect(song.privilege).toHaveProperty('extraRight', { keep: true });
  expect(song.id).toBe(styleSong.response.body.data.songs[0]?.id);
});
