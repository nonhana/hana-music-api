import { expect, expectTypeOf, test } from 'bun:test';

import { CloudsearchBody } from '../../index.ts';
import type { SearchSuggestBody } from '../../index.ts';
import type { Recording } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import searchAlbum from '../fixtures/netease/search/cloudsearch.album.json';
import searchArtist from '../fixtures/netease/search/cloudsearch.artist.json';
import searchPlaylist from '../fixtures/netease/search/cloudsearch.playlist.json';
import searchSong from '../fixtures/netease/search/cloudsearch.song.json';
import suggestAllCategories from '../fixtures/netease/search/kinds/002-search_suggest.json';
import suggestMobile from '../fixtures/netease/search/search_suggest.mobile.json';

type SearchCase = {
  readonly name: string;
  readonly recording: Recording;
  readonly field: string;
  readonly recordKey: string;
  readonly call: (upstream: unknown) => Promise<{ body: unknown }>;
  readonly module: string;
};

const cases: Array<SearchCase> = [
  {
    name: 'cloudsearch songs',
    recording: searchSong,
    field: 'songs',
    recordKey: 'id',
    call: (upstream) => replay(upstream).cloudsearch(searchSong.query),
    module: 'cloudsearch',
  },
  {
    name: 'cloudsearch albums',
    recording: searchAlbum,
    field: 'albums',
    recordKey: 'id',
    call: (upstream) => replay(upstream).cloudsearch(searchAlbum.query),
    module: 'cloudsearch',
  },
  {
    name: 'cloudsearch artists',
    recording: searchArtist,
    field: 'artists',
    recordKey: 'id',
    call: (upstream) => replay(upstream).cloudsearch(searchArtist.query),
    module: 'cloudsearch',
  },
  {
    name: 'cloudsearch playlists',
    recording: searchPlaylist,
    field: 'playlists',
    recordKey: 'id',
    call: (upstream) => replay(upstream).cloudsearch(searchPlaylist.query),
    module: 'cloudsearch',
  },
  {
    name: 'searchSuggest songs',
    recording: suggestAllCategories,
    field: 'songs',
    recordKey: 'id',
    call: (upstream) =>
      replay(upstream).searchSuggest(suggestAllCategories.query),
    module: 'search_suggest',
  },
  {
    name: 'searchSuggest artists',
    recording: suggestAllCategories,
    field: 'artists',
    recordKey: 'id',
    call: (upstream) =>
      replay(upstream).searchSuggest(suggestAllCategories.query),
    module: 'search_suggest',
  },
  {
    name: 'searchSuggest albums',
    recording: suggestAllCategories,
    field: 'albums',
    recordKey: 'id',
    call: (upstream) =>
      replay(upstream).searchSuggest(suggestAllCategories.query),
    module: 'search_suggest',
  },
  {
    name: 'searchSuggest playlists',
    recording: suggestAllCategories,
    field: 'playlists',
    recordKey: 'id',
    call: (upstream) =>
      replay(upstream).searchSuggest(suggestAllCategories.query),
    module: 'search_suggest',
  },
  {
    name: 'searchSuggest allMatch',
    recording: suggestMobile,
    field: 'allMatch',
    recordKey: 'keyword',
    call: (upstream) => replay(upstream).searchSuggest(suggestMobile.query),
    module: 'search_suggest',
  },
];

const resultOf = (body: unknown) =>
  (body as { result: Record<string, unknown> }).result;

test.each(cases)(
  '$name can be missing without failing the response',
  async ({ recording, field, call }) => {
    const upstream = structuredClone(recording.response.body);
    delete resultOf(upstream)[field];

    const result = await call(upstream);

    expect(resultOf(result.body)).not.toHaveProperty(field);
  },
);

test.each(cases)(
  '$name can be null without failing the response',
  async ({ recording, field, call }) => {
    const upstream = structuredClone(recording.response.body);
    resultOf(upstream)[field] = null;

    const result = await call(upstream);

    expect(resultOf(result.body)[field]).toBeNull();
  },
);

test.each(cases)(
  '$name rejects a record of the wrong type when the list is present',
  async ({ recording, field, recordKey, call, module }) => {
    const upstream = structuredClone(recording.response.body);
    const record = (
      resultOf(upstream)[field] as Array<Record<string, unknown>>
    )[0];
    record![recordKey] = recordKey === 'id' ? '1' : 1;

    await expectUpstreamShapeRejection(call(upstream), {
      module,
      path: `body.result.${field}[0].${recordKey}`,
      expected: recordKey === 'id' ? 'number' : 'string',
      actual: recordKey === 'id' ? 'string' : 'number',
    });
  },
);

test.each(cases)(
  '$name rejects a record missing its tightened key when the list is present',
  async ({ recording, field, recordKey, call, module }) => {
    const upstream = structuredClone(recording.response.body);
    const record = (
      resultOf(upstream)[field] as Array<Record<string, unknown>>
    )[0];
    delete record![recordKey];

    await expectUpstreamShapeRejection(call(upstream), {
      module,
      path: `body.result.${field}[0].${recordKey}`,
      expected: 'present',
      actual: 'missing',
    });
  },
);

test('optional result list records keep their tightened key types', () => {
  expectTypeOf<
    NonNullable<CloudsearchBody['result']['songs']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchSuggestBody['result']['allMatch']>[number]['keyword']
  >().toEqualTypeOf<string>();

  const result = validateSync(CloudsearchBody, { code: 200, result: {} });

  expect(result.issues).toBeUndefined();
});
