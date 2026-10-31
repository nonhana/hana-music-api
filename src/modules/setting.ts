import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const UserSetting = UpstreamObject({
  userId: Schema.Finite,
  profileSetting: Loose(Schema.Finite),
  ageSetting: Loose(Schema.Finite),
  areaSetting: Loose(Schema.Finite),
  collegeSetting: Loose(Schema.Finite),
  villageAgeSetting: Loose(Schema.Finite),
  followSingerSetting: Loose(Schema.Finite),
  personalServiceSetting: Loose(Schema.Finite),
  topLayerNotifySetting: Loose(Schema.Finite),
  concertSetting: Loose(Schema.Finite),
  phoneFriendSetting: Loose(Schema.Boolean),
  allowKtvRoomNotify: Loose(Schema.Boolean),
  broadcastSetting: Loose(Schema.Finite),
  shareSetting: Loose(Schema.Finite),
  socialSetting: Loose(Schema.Finite),
  playRecordSetting: Loose(Schema.Finite),
  allowSubscriptionNotify: Loose(Schema.Boolean),
  allowLikedNotify: Loose(Schema.Boolean),
  allowNewFollowerNotify: Loose(Schema.Boolean),
  needRcmdEvent: Loose(Schema.Boolean),
  allowPlaylistShareNotify: Loose(Schema.Boolean),
  allowDJProgramShareNotify: Loose(Schema.Boolean),
  allowDJProgramSubscriptionNotify: Loose(Schema.Boolean),
  allowDJRadioSubscriptionNotify: Loose(Schema.Boolean),
  allowPeopleCanSeeMyPlayRecord: Loose(Schema.Boolean),
  allowFollowedCanSeeMyPlayRecord: Loose(Schema.Boolean),
  allowOfflinePrivateMessageNotify: Loose(Schema.Boolean),
  allowOfflineCommentNotify: Loose(Schema.Boolean),
  allowOfflineCommentReplyNotify: Loose(Schema.Boolean),
  allowOfflineNotify: Loose(Schema.Boolean),
  allowVideoSubscriptionNotify: Loose(Schema.Boolean),
  allowOfflineForwardNotify: Loose(Schema.Boolean),
  sendMiuiMsg: Loose(Schema.Boolean),
  allowImportDoubanPlaylist: Loose(Schema.Boolean),
  allowImportXiamiPlaylist: Loose(Schema.Boolean),
  importedDoubanPlaylist: Loose(Schema.Boolean),
  importedXiamiPlaylist: Loose(Schema.Boolean),
  peopleNearbyCanSeeMe: Loose(Schema.Boolean),
  finishedFollowGuide: Loose(Schema.Boolean),
  showedSharkBabyVinylEntry: Loose(Schema.Finite),
  video_bg_switch_key: Loose(Schema.Finite),
  showSearchAtBottomTab: Loose(Schema.Finite),
  adRecommendSetting: Loose(Schema.Finite),
  socialPlaylistSetting: Loose(Schema.Finite),
  showFMAtBottomTabMagicOs: Loose(Schema.Finite),
  showSearchAtBottomTabMagicOs: Loose(Schema.Finite),
  inNoteBeta: Loose(Schema.Finite),
  double_flow_auto_play_switch: Loose(Schema.Finite),
  showFMAtBottomTab: Loose(Schema.Finite),
  allowNoteRedSongNotify: Loose(Schema.Finite),
  allowCommentFavoriteNotify: Loose(Schema.Finite),
  fansRequestUpdate: Loose(Schema.Finite),
  mutualFollowSeeOnline: Loose(Schema.Finite),
  showNoteAtBottomTab: Loose(Schema.Finite),
  showMoreLocalsListenLabel: Loose(Schema.Finite),
  commentLiveBroadcastSetting: Loose(Schema.Finite),
  allowNotePlaySongNotify: Loose(Schema.Finite),
  allowThankendNotify: Loose(Schema.Finite),
  commentSetting: Loose(Schema.Finite),
  showMagentAtBottomTab: Loose(Schema.Finite),
  personalizedAdRecommendSwitch: Loose(Schema.Finite),
  musicJarReceiveNotifySwitch: Loose(Schema.Finite),
  voiceAutoPlay: Loose(Schema.Finite),
  user_auto_play_switch: Loose(Schema.Finite),
  showSearchMagent: Loose(Schema.Finite),
  messageRejectStatus: Loose(Schema.Finite),
  showCityMusicStyleLabel: Loose(Schema.Finite),
  allowSongRedSongNotify: Loose(Schema.Finite),
  reduceAdSwitch: Loose(Schema.Finite),
});

// 返回码和设置路径 `setting` 收紧；`setting.userId` 是记录自己的编号，也是接口要拿的那一项，
// 其余设置项全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    setting: UserSetting,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const setting: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/setting`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('setting', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 设置
 */
export default setting;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
