import { expectTypeOf } from 'bun:test';

import type { PlaylistSummary, PlaylistUser } from '../../index.ts';
import type { UnknownJson } from '../../src/types/unknown.ts';

type ExpectedPlaylist = {
  readonly id: number;
  readonly trackCount: number;
  readonly updateTime: number;
  readonly trackUpdateTime: number;
  readonly playCount: number;
  readonly privacy: number;
  readonly specialType: number;
  readonly status: number;
  readonly name: string;
  readonly coverImgUrl: string;
  readonly description: string | null;
  readonly tags: ReadonlyArray<string>;
  readonly subscribed: boolean | null;
  readonly creator: PlaylistUser;
  readonly adType?: number;
  readonly backgroundCoverId?: number;
  readonly cloudTrackCount?: number;
  readonly coverImgId?: number;
  readonly createTime?: number;
  readonly subscribedCount?: number;
  readonly titleImage?: number;
  readonly trackNumberUpdateTime?: number;
  readonly userId?: number;
  readonly commentThreadId?: string;
  readonly backgroundCoverUrl?: string | null;
  readonly coverImgId_str?: string | null;
  readonly englishTitle?: string | null;
  readonly titleImageUrl?: string | null;
  readonly updateFrequency?: string | null;
  readonly copied?: boolean;
  readonly highQuality?: boolean;
  readonly mix?: boolean;
  readonly newImported?: boolean;
  readonly opRecommend?: boolean;
  readonly ordered?: boolean;
  readonly subscribers?: ReadonlyArray<PlaylistUser>;
};

type ExpectedUser = {
  readonly userId: number;
  readonly nickname: string;
  readonly accountStatus?: number;
  readonly authStatus?: number;
  readonly authenticationTypes?: number;
  readonly authority?: number;
  readonly avatarImgId?: number;
  readonly backgroundImgId?: number;
  readonly birthday?: number;
  readonly city?: number;
  readonly djStatus?: number;
  readonly gender?: number;
  readonly province?: number;
  readonly userType?: number;
  readonly vipType?: number;
  readonly avatarImgIdStr?: string;
  readonly avatarImgId_str?: string;
  readonly avatarUrl?: string;
  readonly description?: string;
  readonly detailDescription?: string;
  readonly signature?: string;
  readonly backgroundImgIdStr?: string;
  readonly backgroundUrl?: string | null;
  readonly anchor?: boolean;
  readonly defaultAvatar?: boolean;
  readonly followed?: boolean;
  readonly mutual?: boolean;
  readonly expertTags?: ReadonlyArray<string> | null;
  readonly avatarDetail?: { readonly [key: string]: UnknownJson } | null;
  readonly experts?: { readonly [key: string]: UnknownJson } | null;
};

expectTypeOf<
  Pick<PlaylistSummary, keyof ExpectedPlaylist>
>().toEqualTypeOf<ExpectedPlaylist>();
expectTypeOf<
  Pick<PlaylistUser, keyof ExpectedUser>
>().toEqualTypeOf<ExpectedUser>();
expectTypeOf<PlaylistSummary['sharedUsers']>().toEqualTypeOf<UnknownJson>();
expectTypeOf<PlaylistSummary['tracks']>().toEqualTypeOf<UnknownJson>();
expectTypeOf<PlaylistUser['remarkName']>().toEqualTypeOf<UnknownJson>();
