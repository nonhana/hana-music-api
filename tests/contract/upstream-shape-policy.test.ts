import { expect, test } from 'bun:test';

import {
  AlbumBody,
  CloudsearchBody,
  PlaylistDetailBody,
  SongDetailBody,
  UserAccountBody,
} from '../../index.ts';
import { validateSync } from '../_kit/assertions.ts';
import album from '../fixtures/netease/library/album.json';
import detail from '../fixtures/netease/library/playlist_detail.own-small.json';
import songDetail from '../fixtures/netease/library/song_detail.vip.json';
import account from '../fixtures/netease/login/user_account.vip.json';
import searchSong from '../fixtures/netease/search/cloudsearch.song.json';

const clone = <T>(value: T): T => structuredClone(value);

test('loose fields accept a missing value and leave it missing', () => {
  const upstream = clone(album.response.body);
  delete (upstream.songs[0] as { dt?: number }).dt;

  const result = validateSync(AlbumBody, upstream);

  expect(result.issues).toBeUndefined();
  expect((result.value as typeof upstream).songs[0]).not.toHaveProperty('dt');
});

test('loose fields keep null', () => {
  const upstream = clone(album.response.body);
  (upstream.songs[0] as { dt: number | null }).dt = null;

  const result = validateSync(AlbumBody, upstream);

  expect(result.issues).toBeUndefined();
  expect((result.value as typeof upstream).songs[0]?.dt).toBeNull();
});

test('loose fields treat a value of the wrong type as missing', () => {
  const upstream = clone(album.response.body);
  (upstream.songs[0] as { dt: unknown }).dt = '180000';
  (upstream.songs[0]!.al as { name: unknown }).name = 123;
  (upstream.album as { description: unknown }).description = ['text'];

  const result = validateSync(AlbumBody, upstream);

  expect(result.issues).toBeUndefined();
  const value = result.value as typeof upstream;
  expect(value.songs[0]).not.toHaveProperty('dt');
  expect(value.songs[0]?.al).not.toHaveProperty('name');
  expect(value.album).not.toHaveProperty('description');
});

test('lists that may be missing still reject an invalid record when present', () => {
  const upstream = clone(searchSong.response.body);
  (upstream.result.songs[0] as { id: unknown }).id = '1409311773';

  const result = validateSync(CloudsearchBody, upstream);

  expect(result.issues).toHaveLength(1);
});

test('strict fields reject a missing value', () => {
  const upstream = clone(album.response.body);
  delete (upstream.album as { id?: number }).id;

  const result = validateSync(AlbumBody, upstream);

  expect(result.issues).toHaveLength(1);
});

test('strict fields reject a value of the wrong type', () => {
  const upstream = clone(songDetail.response.body);
  (upstream.songs[0] as { id: unknown }).id = '2636391253';

  const result = validateSync(SongDetailBody, upstream);

  expect(result.issues).toHaveLength(1);
});

test('newly declared song and album fields are loose', () => {
  const upstream = clone(album.response.body);
  const song = upstream.songs[0] as Record<string, unknown>;
  song.no = '1';
  song.alia = 'alias';
  (upstream.album as { company: unknown }).company = 42;

  const result = validateSync(AlbumBody, upstream);

  expect(result.issues).toBeUndefined();
  const value = result.value as typeof upstream;
  expect(value.songs[0]).not.toHaveProperty('no');
  expect(value.songs[0]).not.toHaveProperty('alia');
  expect(value.album).not.toHaveProperty('company');
});

test('newly declared playlist and account fields are loose', () => {
  const upstream = {
    code: 200,
    playlist: {
      ...clone(detail.response.body.playlist),
      shareCount: 'many',
    },
  };
  const result = validateSync(PlaylistDetailBody, upstream);

  expect(result.issues).toBeUndefined();
  expect((result.value as typeof upstream).playlist).not.toHaveProperty(
    'shareCount',
  );

  const accountResult = validateSync(UserAccountBody, {
    ...clone(account.response.body),
    account: {
      ...clone(account.response.body.account),
      createTime: 'yesterday',
    },
  });
  expect(accountResult.issues).toBeUndefined();
  expect(
    (accountResult.value as typeof account.response.body).account,
  ).not.toHaveProperty('createTime');
});

test('undeclared fields are preserved at every level', () => {
  const upstream = {
    ...clone(album.response.body),
    futureBodyField: { preserved: true },
    album: {
      ...clone(album.response.body).album,
      futureAlbumField: ['preserved'],
    },
    songs: [
      {
        ...clone(album.response.body).songs[0],
        futureSongField: null,
      },
    ],
  };

  const result = validateSync(AlbumBody, upstream);

  expect(result.value).toEqual(upstream);
});
