import { expectTypeOf } from 'bun:test';

import type { PlaylistSummary, PlaylistUser } from '../../index.ts';
import type { UnknownJson } from '../../src/types/unknown.ts';

type Loose<T> = T | null | undefined;

type ExpectedPlaylist = {
  readonly id: number;
  readonly trackCount?: Loose<number>;
  readonly updateTime?: Loose<number>;
  readonly trackUpdateTime?: Loose<number>;
  readonly playCount?: Loose<number>;
  readonly privacy?: Loose<number>;
  readonly specialType?: Loose<number>;
  readonly status?: Loose<number>;
  readonly name?: Loose<string>;
  readonly coverImgUrl?: Loose<string>;
  readonly description?: Loose<string>;
  readonly tags?: Loose<ReadonlyArray<string>>;
  readonly subscribed?: Loose<boolean>;
  readonly creator?: Loose<PlaylistUser>;
  readonly adType?: Loose<number>;
  readonly backgroundCoverId?: Loose<number>;
  readonly cloudTrackCount?: Loose<number>;
  readonly coverImgId?: Loose<number>;
  readonly createTime?: Loose<number>;
  readonly subscribedCount?: Loose<number>;
  readonly titleImage?: Loose<number>;
  readonly trackNumberUpdateTime?: Loose<number>;
  readonly userId?: Loose<number>;
  readonly commentThreadId?: Loose<string>;
  readonly backgroundCoverUrl?: Loose<string>;
  readonly coverImgId_str?: Loose<string>;
  readonly englishTitle?: Loose<string>;
  readonly titleImageUrl?: Loose<string>;
  readonly updateFrequency?: Loose<string>;
  readonly copied?: Loose<boolean>;
  readonly highQuality?: Loose<boolean>;
  readonly mix?: Loose<boolean>;
  readonly newImported?: Loose<boolean>;
  readonly opRecommend?: Loose<boolean>;
  readonly ordered?: Loose<boolean>;
  readonly subscribers?: Loose<ReadonlyArray<PlaylistUser>>;
};

type ExpectedUser = {
  readonly userId?: Loose<number>;
  readonly nickname?: Loose<string>;
  readonly accountStatus?: Loose<number>;
  readonly authStatus?: Loose<number>;
  readonly authenticationTypes?: Loose<number>;
  readonly authority?: Loose<number>;
  readonly avatarImgId?: Loose<number>;
  readonly backgroundImgId?: Loose<number>;
  readonly birthday?: Loose<number>;
  readonly city?: Loose<number>;
  readonly djStatus?: Loose<number>;
  readonly gender?: Loose<number>;
  readonly province?: Loose<number>;
  readonly userType?: Loose<number>;
  readonly vipType?: Loose<number>;
  readonly avatarImgIdStr?: Loose<string>;
  readonly avatarImgId_str?: Loose<string>;
  readonly avatarUrl?: Loose<string>;
  readonly description?: Loose<string>;
  readonly detailDescription?: Loose<string>;
  readonly signature?: Loose<string>;
  readonly backgroundImgIdStr?: Loose<string>;
  readonly backgroundUrl?: Loose<string>;
  readonly anchor?: Loose<boolean>;
  readonly defaultAvatar?: Loose<boolean>;
  readonly followed?: Loose<boolean>;
  readonly mutual?: Loose<boolean>;
  readonly expertTags?: Loose<ReadonlyArray<string>>;
};

expectTypeOf<
  Pick<PlaylistSummary, keyof ExpectedPlaylist>
>().toEqualTypeOf<ExpectedPlaylist>();
expectTypeOf<
  Pick<PlaylistUser, keyof ExpectedUser>
>().toEqualTypeOf<ExpectedUser>();
expectTypeOf<PlaylistUser['remarkName']>().toEqualTypeOf<UnknownJson>();
