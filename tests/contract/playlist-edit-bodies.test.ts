import { expect, test } from 'bun:test';

import {
  AlbumSubBody,
  ArtistSubBody,
  createHanaMusicApi,
  ImageUploadTokenBody,
  LikeBody,
  PlaylistCatlistBody,
  PlaylistCoverUpdateBody,
  PlaylistCreateBody,
  PlaylistDeleteBody,
  PlaylistDescUpdateBody,
  PlaylistNameUpdateBody,
  PlaylistOrderUpdateBody,
  PlaylistPrivacyBody,
  PlaylistSubscribeBody,
  PlaylistTagsUpdateBody,
  PlaylistTracksBody,
  SongOrderUpdateBody,
} from '../../index.ts';
import type { HanaMusicApiClient } from '../../src/sdk/generated/client.generated.ts';
import type {
  Recording,
  UpstreamShape,
  Validator,
} from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection, settle } from '../_kit/assertions.ts';
import albumSub from '../fixtures/netease/like-collect/album_sub.subscribe.json';
import artistSub from '../fixtures/netease/like-collect/artist_sub.subscribe.json';
import like from '../fixtures/netease/like-collect/like.like.json';
import imageUploadToken from '../fixtures/netease/playlist-edit/image_upload_token.json';
import catlist from '../fixtures/netease/playlist-edit/playlist_catlist.json';
import cover from '../fixtures/netease/playlist-edit/playlist_cover_update.imgid.json';
import create from '../fixtures/netease/playlist-edit/playlist_create.private.json';
import deletePlaylist from '../fixtures/netease/playlist-edit/playlist_delete.json';
import descUpdate from '../fixtures/netease/playlist-edit/playlist_desc_update.json';
import nameUpdate from '../fixtures/netease/playlist-edit/playlist_name_update.json';
import orderUpdate from '../fixtures/netease/playlist-edit/playlist_order_update.json';
import privacy from '../fixtures/netease/playlist-edit/playlist_privacy.json';
import tagsUpdate from '../fixtures/netease/playlist-edit/playlist_tags_update.3-tags.json';
import addTracks from '../fixtures/netease/playlist-edit/playlist_tracks.add.json';
import deleteTracks from '../fixtures/netease/playlist-edit/playlist_tracks.del.json';
import songOrderUpdate from '../fixtures/netease/playlist-edit/song_order_update.whole-4967-small-change.json';
import playlistSubscribe from '../fixtures/netease/playlist_subscribe/subscribe.json';
import playlistUnsubscribe from '../fixtures/netease/playlist_subscribe/unsubscribe.json';

const replay = (upstream: unknown) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=playlist-edit',
    fetcher: async () => Response.json(upstream),
  });

type BodyCase = {
  name: string;
  recording: Recording;
  call: (client: HanaMusicApiClient) => Promise<unknown>;
  expected?: unknown;
  upstream?: unknown;
};

const bodyCases: Array<BodyCase> = [
  {
    name: 'like',
    recording: like,
    call: (client) => client.like(like.query),
  },
  {
    name: 'albumSub',
    recording: albumSub,
    call: (client) =>
      client.albumSub({ ...albumSub.query, t: albumSub.query.t as 1 }),
  },
  {
    name: 'artistSub',
    recording: artistSub,
    call: (client) =>
      client.artistSub({ ...artistSub.query, t: artistSub.query.t as 1 }),
  },
  {
    name: 'playlistCatlist',
    recording: catlist,
    call: (client) => client.playlistCatlist(catlist.query),
  },
  {
    name: 'playlistCreate',
    recording: create,
    call: (client) => client.playlistCreate(create.query),
  },
  {
    name: 'playlistDelete',
    recording: deletePlaylist,
    call: (client) => client.playlistDelete(deletePlaylist.query),
  },
  {
    name: 'playlistDescUpdate',
    recording: descUpdate,
    call: (client) => client.playlistDescUpdate(descUpdate.query),
  },
  {
    name: 'playlistNameUpdate',
    recording: nameUpdate,
    call: (client) => client.playlistNameUpdate(nameUpdate.query),
  },
  {
    name: 'playlistOrderUpdate',
    recording: orderUpdate,
    call: (client) => client.playlistOrderUpdate(orderUpdate.query),
  },
  {
    name: 'playlistPrivacy',
    recording: privacy,
    call: (client) => client.playlistPrivacy(privacy.query),
  },
  {
    name: 'playlistTagsUpdate',
    recording: tagsUpdate,
    call: (client) => client.playlistTagsUpdate(tagsUpdate.query),
  },
  {
    name: 'playlistTracks add',
    recording: addTracks,
    call: (client) => client.playlistTracks(addTracks.query),
    expected: addTracks.response.body.body,
  },
  {
    name: 'playlistTracks delete',
    recording: deleteTracks,
    call: (client) => client.playlistTracks(deleteTracks.query),
    expected: deleteTracks.response.body.body,
  },
  {
    name: 'playlistSubscribe',
    recording: playlistSubscribe,
    call: (client) => client.playlistSubscribe(playlistSubscribe.query),
  },
  {
    name: 'playlistSubscribe unsubscribe',
    recording: playlistUnsubscribe,
    call: (client) => client.playlistSubscribe(playlistUnsubscribe.query),
  },
  {
    name: 'playlistCoverUpdate',
    recording: cover,
    upstream: cover.response.body.data,
    call: (client) => client.playlistCoverUpdate(cover.query),
  },
  {
    name: 'songOrderUpdate',
    recording: songOrderUpdate,
    call: (client) => client.songOrderUpdate(songOrderUpdate.query),
  },
];

test.each(bodyCases)('$name returns the recorded body', async (testCase) => {
  const result = (await testCase.call(
    replay(testCase.upstream ?? testCase.recording.response.body),
  )) as { body: unknown };
  expect(result.body).toEqual(
    testCase.expected ?? testCase.recording.response.body,
  );
});

test.each([
  { name: 'LikeBody', schema: LikeBody, recording: like },
  { name: 'AlbumSubBody', schema: AlbumSubBody, recording: albumSub },
  { name: 'ArtistSubBody', schema: ArtistSubBody, recording: artistSub },
  {
    name: 'PlaylistCatlistBody',
    schema: PlaylistCatlistBody,
    recording: catlist,
  },
  { name: 'PlaylistCreateBody', schema: PlaylistCreateBody, recording: create },
  {
    name: 'PlaylistDeleteBody',
    schema: PlaylistDeleteBody,
    recording: deletePlaylist,
  },
  {
    name: 'PlaylistDescUpdateBody',
    schema: PlaylistDescUpdateBody,
    recording: descUpdate,
  },
  {
    name: 'PlaylistNameUpdateBody',
    schema: PlaylistNameUpdateBody,
    recording: nameUpdate,
  },
  {
    name: 'PlaylistOrderUpdateBody',
    schema: PlaylistOrderUpdateBody,
    recording: orderUpdate,
  },
  {
    name: 'PlaylistPrivacyBody',
    schema: PlaylistPrivacyBody,
    recording: privacy,
  },
  {
    name: 'PlaylistTagsUpdateBody',
    schema: PlaylistTagsUpdateBody,
    recording: tagsUpdate,
  },
  {
    name: 'PlaylistTracksBody',
    schema: PlaylistTracksBody,
    recording: addTracks,
    value: addTracks.response.body.body,
  },
  {
    name: 'PlaylistSubscribeBody',
    schema: PlaylistSubscribeBody,
    recording: playlistSubscribe,
  },
  {
    name: 'PlaylistCoverUpdateBody',
    schema: PlaylistCoverUpdateBody,
    recording: cover,
  },
  {
    name: 'SongOrderUpdateBody',
    schema: SongOrderUpdateBody,
    recording: songOrderUpdate,
  },
  {
    name: 'ImageUploadTokenBody',
    schema: ImageUploadTokenBody,
    recording: imageUploadToken,
  },
] as Array<{
  name: string;
  schema: Validator;
  recording: Recording;
  value?: object;
}>)(
  '$name validates the recording through Standard Schema',
  ({ schema, recording, value }) => {
    expect(
      schema['~standard'].validate(value ?? recording.response.body),
    ).toEqual({
      value: value ?? recording.response.body,
    });
  },
);

test('declared fields are validated while undeclared fields remain available', async () => {
  const upstream = structuredClone(like.response.body) as Record<
    string,
    unknown
  >;
  upstream.future = { preserved: true };
  const result = await replay(upstream).like(like.query);

  expect(result.body).toMatchObject({ future: { preserved: true } });
});

test('playlistTracks rejects a nested business failure', async () => {
  const recording =
    await import('../fixtures/netease/playlist-edit/playlist_tracks.add-duplicate.json');
  const result = await settle(
    replay(recording.default.response.body).playlistTracks(
      recording.default.query,
    ),
  );

  expect(result).toEqual({
    rejected: {
      status: 502,
      cookie: [],
      body: { code: 502, message: '歌单内歌曲重复' },
    },
  });
});

test('songOrderUpdate maps the recorded -1 response to a rejected call', async () => {
  const recording =
    await import('../fixtures/netease/playlist-edit/song_order_update.missing-one.json');
  const result = await settle(
    replay(recording.default.response.body).songOrderUpdate(
      recording.default.query,
    ),
  );

  expect(result).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: recording.default.response.body,
    },
  });
});

test.each<{
  name: string;
  call: () => Promise<unknown>;
  shape: UpstreamShape;
}>([
  {
    name: 'like without playlist id',
    call: () => {
      const upstream = structuredClone(like.response.body) as Record<
        string,
        unknown
      >;
      delete upstream.playlistId;
      return replay(upstream).like(like.query);
    },
    shape: {
      module: 'like',
      path: 'body.playlistId',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'playlist catlist without a category name',
    call: () => {
      const upstream = structuredClone(catlist.response.body) as {
        sub: Array<Record<string, unknown>>;
      } & Record<string, unknown>;
      delete upstream.sub[0]?.name;
      return replay(upstream).playlistCatlist(catlist.query);
    },
    shape: {
      module: 'playlist_catlist',
      path: 'body.sub[0].name',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'playlist create without the created playlist id',
    call: () => {
      const upstream = structuredClone(create.response.body) as {
        playlist: Record<string, unknown>;
      } & Record<string, unknown>;
      delete upstream.playlist.id;
      return replay(upstream).playlistCreate(create.query);
    },
    shape: {
      module: 'playlist_create',
      path: 'body.playlist.id',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'playlist track delete without count',
    call: () => {
      const upstream = structuredClone(deleteTracks.response.body) as {
        body: Record<string, unknown>;
      };
      delete upstream.body.count;
      return replay(upstream).playlistTracks(deleteTracks.query);
    },
    shape: {
      module: 'playlist_tracks',
      path: 'body.count',
      expected: 'present',
      actual: 'missing',
    },
  },
])('$name rejects as an upstream shape change', ({ call, shape }) =>
  expectUpstreamShapeRejection(call(), shape),
);
