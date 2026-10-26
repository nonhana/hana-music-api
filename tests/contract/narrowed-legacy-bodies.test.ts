import { expect, expectTypeOf, test } from 'bun:test';

import {
  ArtistDetailBody,
  ArtistsBody,
  UserRecordBody,
  VipInfoBody,
  VipInfoV2Body,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import artistDetail from '../fixtures/netease/library/artist_detail.json';
import artists from '../fixtures/netease/library/artists.json';
import userRecordAll from '../fixtures/netease/library/user_record.all.json';
import userRecordWeek from '../fixtures/netease/library/user_record.week.json';
import vipInfo from '../fixtures/netease/login/vip_info.vip.json';
import vipInfoV2 from '../fixtures/netease/login/vip_info_v2.vip.json';

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (upstream: unknown) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'artist_detail',
    recording: artistDetail,
    bodySchema: ArtistDetailBody,
    call: (upstream) =>
      replay(upstream).artistDetail({ id: String(artistDetail.query.id) }),
  },
  {
    name: 'artists',
    recording: artists,
    bodySchema: ArtistsBody,
    call: (upstream) =>
      replay(upstream).artists({ id: String(artists.query.id) }),
  },
  {
    name: 'user_record all',
    recording: userRecordAll,
    bodySchema: UserRecordBody,
    call: (upstream) =>
      replay(upstream).userRecord({
        uid: userRecordAll.query.uid,
        type: userRecordAll.query.type as 0 | 1,
      }),
  },
  {
    name: 'user_record week',
    recording: userRecordWeek,
    bodySchema: UserRecordBody,
    call: (upstream) =>
      replay(upstream).userRecord({
        uid: userRecordWeek.query.uid,
        type: userRecordWeek.query.type as 0 | 1,
      }),
  },
  {
    name: 'vip_info',
    recording: vipInfo,
    bodySchema: VipInfoBody,
    call: (upstream) => replay(upstream).vipInfo({}),
  },
  {
    name: 'vip_info_v2',
    recording: vipInfoV2,
    bodySchema: VipInfoV2Body,
    call: (upstream) => replay(upstream).vipInfoV2({}),
  },
];

test.each(cases)(
  '$name returns and preserves its recording',
  async ({ recording, bodySchema, call }) => {
    const result = await call(recording.response.body);

    expect(result.body).toEqual(recording.response.body);
    const validated = validateSync(bodySchema, recording.response.body);
    expect(validated.issues).toBeUndefined();
    expect(validated.value).toEqual(recording.response.body);
  },
);

test('new bodies tighten the identifiers the interfaces return', () => {
  expectTypeOf<
    ArtistDetailBody['data']['artist']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<ArtistsBody['hotSongs'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<UserRecordBody['allData']>[number]['song']['id']
  >().toEqualTypeOf<number>();
});

test('artist_detail rejects a missing returned artist id', async () => {
  const upstream = structuredClone(artistDetail.response.body);
  delete (upstream as { data: { artist: { id?: number } } }).data.artist.id;

  await expectUpstreamShapeRejection(
    replay(upstream).artistDetail({ id: String(artistDetail.query.id) }),
    {
      module: 'artist_detail',
      path: 'body.data.artist.id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artists rejects a hot song with a nonnumeric id', async () => {
  const upstream = structuredClone(artists.response.body);
  (upstream.hotSongs[0] as { id: unknown }).id = '1472480890';

  await expectUpstreamShapeRejection(
    replay(upstream).artists({ id: String(artists.query.id) }),
    {
      module: 'artists',
      path: 'body.hotSongs[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_record rejects a play record without a song', async () => {
  const upstream = structuredClone(userRecordAll.response.body);
  delete (upstream.allData[0] as { song?: unknown }).song;

  await expectUpstreamShapeRejection(
    replay(upstream).userRecord({
      uid: userRecordAll.query.uid,
      type: userRecordAll.query.type as 0 | 1,
    }),
    {
      module: 'user_record',
      path: 'body.allData[0].song',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_record rejects a play record with a nonnumeric song id', async () => {
  const upstream = structuredClone(userRecordAll.response.body);
  (upstream.allData[0]!.song as { id: unknown }).id = '535517304';

  await expectUpstreamShapeRejection(
    replay(upstream).userRecord({
      uid: userRecordAll.query.uid,
      type: userRecordAll.query.type as 0 | 1,
    }),
    {
      module: 'user_record',
      path: 'body.allData[0].song.id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('vip_info rejects a response without data', async () => {
  const upstream = structuredClone(vipInfo.response.body);
  delete (upstream as { data?: unknown }).data;

  await expectUpstreamShapeRejection(replay(upstream).vipInfo({}), {
    module: 'vip_info',
    path: 'body.data',
    expected: 'present',
    actual: 'missing',
  });
});

test('vip_info_v2 rejects a response without data', async () => {
  const upstream = structuredClone(vipInfoV2.response.body);
  delete (upstream as { data?: unknown }).data;

  await expectUpstreamShapeRejection(replay(upstream).vipInfoV2({}), {
    module: 'vip_info_v2',
    path: 'body.data',
    expected: 'present',
    actual: 'missing',
  });
});
