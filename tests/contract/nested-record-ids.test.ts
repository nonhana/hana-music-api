import { expect, expectTypeOf, test } from 'bun:test';

import {
  PlaylistCreateBody,
  PlaylistDetailBody,
  PlaylistTrackAllBody,
  UserPlaylistBody,
} from '../../index.ts';
import type { SongDetailBody } from '../../index.ts';
import type { Validator } from '../_kit/assertions.ts';
import { validateSync } from '../_kit/assertions.ts';

type NestedCase = {
  readonly name: string;
  readonly schema: Validator;
  readonly body: () => Record<string, unknown>;
  readonly records: (body: unknown) => Array<Record<string, unknown>>;
};

const cases: Array<NestedCase> = [
  {
    name: 'playlist_create playlist.tracks',
    schema: PlaylistCreateBody,
    body: () => ({
      code: 200,
      id: 1,
      playlist: { id: 2, tracks: [{ id: 3 }] },
    }),
    records: (body) =>
      (body as { playlist: { tracks: Array<Record<string, unknown>> } })
        .playlist.tracks,
  },
  {
    name: 'playlist_detail playlist.tracks',
    schema: PlaylistDetailBody,
    body: () => ({
      code: 200,
      playlist: { id: 1, trackIds: [], tracks: [{ id: 2 }] },
    }),
    records: (body) =>
      (body as { playlist: { tracks: Array<Record<string, unknown>> } })
        .playlist.tracks,
  },
  {
    name: 'playlist_detail privileges',
    schema: PlaylistDetailBody,
    body: () => ({
      code: 200,
      playlist: { id: 1, trackIds: [] },
      privileges: [{ id: 2 }],
    }),
    records: (body) =>
      (body as { privileges: Array<Record<string, unknown>> }).privileges,
  },
  {
    name: 'playlist_track_all privileges',
    schema: PlaylistTrackAllBody,
    body: () => ({ code: 200, songs: [], privileges: [{ id: 2 }] }),
    records: (body) =>
      (body as { privileges: Array<Record<string, unknown>> }).privileges,
  },
  {
    name: 'user_playlist playlist.tracks',
    schema: UserPlaylistBody,
    body: () => ({
      code: 200,
      playlist: [{ id: 1, tracks: [{ id: 2 }] }],
    }),
    records: (body) =>
      (body as { playlist: Array<{ tracks: Array<Record<string, unknown>> }> })
        .playlist[0]!.tracks,
  },
];

for (const { name, schema, body, records } of cases) {
  test(`${name} keeps a record whose id is missing`, () => {
    const upstream = body();
    delete records(upstream)[0]!.id;

    const result = validateSync(schema, upstream);

    expect(result.issues).toBeUndefined();
    const [record] = records(result.value);
    expect(record).toBeDefined();
    expect(record).not.toHaveProperty('id');
  });

  test(`${name} keeps a record whose id has the wrong type`, () => {
    const upstream = body();
    records(upstream)[0]!.id = '2';

    const result = validateSync(schema, upstream);

    expect(result.issues).toBeUndefined();
    const [record] = records(result.value);
    expect(record).toBeDefined();
    expect(record).not.toHaveProperty('id');
  });

  test(`${name} keeps a null id as null`, () => {
    const upstream = body();
    records(upstream)[0]!.id = null;

    const result = validateSync(schema, upstream);

    expect(result.issues).toBeUndefined();
    expect(records(result.value)[0]?.id).toBeNull();
  });
}

test('loosened nested ids are typed as number, null or undefined', () => {
  expectTypeOf<
    NonNullable<PlaylistCreateBody['playlist']['tracks']>[number]['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<PlaylistDetailBody['playlist']['tracks']>[number]['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<PlaylistDetailBody['privileges']>[number]['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<PlaylistTrackAllBody['privileges']>[number]['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<UserPlaylistBody['playlist'][number]['tracks']>[number]['id']
  >().toEqualTypeOf<number | null | undefined>();
});

test('required record ids stay tightened', () => {
  expectTypeOf<SongDetailBody['songs'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<
    SongDetailBody['privileges'][number]['id']
  >().toEqualTypeOf<number>();
});
