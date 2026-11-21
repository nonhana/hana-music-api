---
title: '设置'
description: '登录后调用此接口 ，可获取用户设置'
---

# 设置

登录后调用此接口 ，可获取用户设置

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                        |
| ---------- | ----------------------------------------- |
| 接口地址   | `/setting`                                |
| 请求方式   | `GET` / `POST`                            |
| 需要登录   | 是                                        |
| 对应模块   | `setting`                                 |
| SDK 函数   | `setting`（`hana-music-api/api/setting`） |
| 返回体类型 | `SettingBody`（已建模返回体）             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { setting } from 'hana-music-api';

const result = await setting({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/setting' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SettingBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/setting`、`hana-music-api/schemas/setting` 导入运行时校验器）。

```ts
type UserSetting = {
  userId: number;
  profileSetting?: number | null;
  ageSetting?: number | null;
  areaSetting?: number | null;
  collegeSetting?: number | null;
  villageAgeSetting?: number | null;
  followSingerSetting?: number | null;
  personalServiceSetting?: number | null;
  topLayerNotifySetting?: number | null;
  concertSetting?: number | null;
  phoneFriendSetting?: boolean | null;
  allowKtvRoomNotify?: boolean | null;
  broadcastSetting?: number | null;
  shareSetting?: number | null;
  socialSetting?: number | null;
  playRecordSetting?: number | null;
  allowSubscriptionNotify?: boolean | null;
  allowLikedNotify?: boolean | null;
  allowNewFollowerNotify?: boolean | null;
  needRcmdEvent?: boolean | null;
  allowPlaylistShareNotify?: boolean | null;
  allowDJProgramShareNotify?: boolean | null;
  allowDJProgramSubscriptionNotify?: boolean | null;
  allowDJRadioSubscriptionNotify?: boolean | null;
  allowPeopleCanSeeMyPlayRecord?: boolean | null;
  allowFollowedCanSeeMyPlayRecord?: boolean | null;
  allowOfflinePrivateMessageNotify?: boolean | null;
  allowOfflineCommentNotify?: boolean | null;
  allowOfflineCommentReplyNotify?: boolean | null;
  allowOfflineNotify?: boolean | null;
  allowVideoSubscriptionNotify?: boolean | null;
  allowOfflineForwardNotify?: boolean | null;
  sendMiuiMsg?: boolean | null;
  allowImportDoubanPlaylist?: boolean | null;
  allowImportXiamiPlaylist?: boolean | null;
  importedDoubanPlaylist?: boolean | null;
  importedXiamiPlaylist?: boolean | null;
  peopleNearbyCanSeeMe?: boolean | null;
  finishedFollowGuide?: boolean | null;
  showedSharkBabyVinylEntry?: number | null;
  video_bg_switch_key?: number | null;
  showSearchAtBottomTab?: number | null;
  adRecommendSetting?: number | null;
  socialPlaylistSetting?: number | null;
  showFMAtBottomTabMagicOs?: number | null;
  showSearchAtBottomTabMagicOs?: number | null;
  inNoteBeta?: number | null;
  double_flow_auto_play_switch?: number | null;
  showFMAtBottomTab?: number | null;
  allowNoteRedSongNotify?: number | null;
  allowCommentFavoriteNotify?: number | null;
  fansRequestUpdate?: number | null;
  mutualFollowSeeOnline?: number | null;
  showNoteAtBottomTab?: number | null;
  showMoreLocalsListenLabel?: number | null;
  commentLiveBroadcastSetting?: number | null;
  allowNotePlaySongNotify?: number | null;
  allowThankendNotify?: number | null;
  commentSetting?: number | null;
  showMagentAtBottomTab?: number | null;
  personalizedAdRecommendSwitch?: number | null;
  musicJarReceiveNotifySwitch?: number | null;
  voiceAutoPlay?: number | null;
  user_auto_play_switch?: number | null;
  showSearchMagent?: number | null;
  messageRejectStatus?: number | null;
  showCityMusicStyleLabel?: number | null;
  allowSongRedSongNotify?: number | null;
  reduceAdSwitch?: number | null;
};

type SettingBody = {
  code: 200;
  setting: UserSetting;
};
```

| 字段      | 类型          | 必填 | 说明                         |
| --------- | ------------- | ---- | ---------------------------- |
| `code`    | `200`         | 是   | 业务状态码（`200` 表示成功） |
| `setting` | `UserSetting` | 是   | -                            |

<!-- api-doc:response:end -->
