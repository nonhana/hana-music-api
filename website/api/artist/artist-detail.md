---
title: '获取歌手详情'
description: '调用此接口，传入歌手 id，可获得获取歌手详情'
---

# 获取歌手详情

调用此接口，传入歌手 id，可获得获取歌手详情

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/artist/detail`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `artist_detail`                                      |
| SDK 函数   | `artistDetail`（`hana-music-api/api/artist_detail`） |
| 返回体类型 | `ArtistDetailBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistDetail } from 'hana-music-api';

const result = await artistDetail({
  id: '11972054',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/detail' \
  --data-urlencode 'id=11972054'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌手 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_detail`、`hana-music-api/schemas/artist_detail` 导入运行时校验器）。

```ts
type Identify = {
  imageUrl?: string | null;
  imageDesc?: string | null;
  actionUrl?: string | null;
};

type ArtistRank = {
  rank?: number | null;
  type?: number | null;
};

type ArtistDetail = {
  id: number;
  cover?: string | null;
  avatar?: string | null;
  name?: string | null;
  transNames?: Array<string> | null;
  alias?: Array<string> | null;
  identifyTag?: Array<string> | null;
  briefDesc?: string | null;
  rank?: ArtistRank | null;
  albumSize?: number | null;
  musicSize?: number | null;
  mvSize?: number | null;
};

type SecondaryExpertIdentity = {
  expertIdentiyId?: number | null;
  expertIdentiyName?: string | null;
  expertIdentiyCount?: number | null;
};

type ArtistUser = Omit<
  PlaylistUser,
  | 'authenticated'
  | 'userName'
  | 'shortUserName'
  | 'accountType'
  | 'lastLoginIP'
  | 'lastLoginTime'
  | 'locationStatus'
  | 'createTime'
> & {
  authenticated?: boolean | null;
  userName?: string | null;
  shortUserName?: string | null;
  accountType?: number | null;
  lastLoginIP?: string | null;
  lastLoginTime?: number | null;
  locationStatus?: number | null;
  createTime?: number | null;
};

type ArtistDetailBody = {
  code: 200;
  message?: string | null;
  data: {
    videoCount?: number | null;
    vipRights?: VipRights | null;
    identify?: Identify | null;
    artist: ArtistDetail;
    simpleUserIdentify?: Identify | null;
    blacklist?: boolean | null;
    preferShow?: number | null;
    showPriMsg?: boolean | null;
    secondaryExpertIdentiy?: Array<SecondaryExpertIdentity> | null;
    eventCount?: number | null;
    user?: ArtistUser | null;
  };
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)、[VipRights](/api/shared-types#viprights)

| 字段                                               | 类型                                     | 必填 | 说明                                                  |
| -------------------------------------------------- | ---------------------------------------- | ---- | ----------------------------------------------------- |
| `code`                                             | `200`                                    | 是   | 业务状态码（`200` 表示成功）                          |
| `message`                                          | `string`                                 | 否   | 返回说明信息                                          |
| `data`                                             | `object`                                 | 是   | 接口返回的数据主体                                    |
| `data.videoCount`                                  | `number`                                 | 否   | -                                                     |
| `data.vipRights`                                   | [VipRights](/api/shared-types#viprights) | 否   | VipRights 实体                                        |
| `data.identify`                                    | `Identify`                               | 否   | -                                                     |
| `data.identify.imageUrl`                           | `string`                                 | 否   | 资源访问链接                                          |
| `data.identify.imageDesc`                          | `string`                                 | 否   | -                                                     |
| `data.identify.actionUrl`                          | `string`                                 | 否   | 资源访问链接                                          |
| `data.artist`                                      | `ArtistDetail`                           | 是   | 歌手详情                                              |
| `data.artist.id`                                   | `number`                                 | 是   | 记录 ID                                               |
| `data.artist.cover`                                | `string`                                 | 否   | 封面图片 URL                                          |
| `data.artist.avatar`                               | `string`                                 | 否   | -                                                     |
| `data.artist.name`                                 | `string`                                 | 否   | 名称                                                  |
| `data.artist.transNames`                           | `Array<string>`                          | 否   | -                                                     |
| `data.artist.alias`                                | `Array<string>`                          | 否   | -                                                     |
| `data.artist.identifyTag`                          | `Array<string>`                          | 否   | -                                                     |
| `data.artist.briefDesc`                            | `string`                                 | 否   | -                                                     |
| `data.artist.rank`                                 | `ArtistRank`                             | 否   | -                                                     |
| `data.artist.albumSize`                            | `number`                                 | 否   | -                                                     |
| `data.artist.musicSize`                            | `number`                                 | 否   | -                                                     |
| `data.artist.mvSize`                               | `number`                                 | 否   | -                                                     |
| `data.simpleUserIdentify`                          | `Identify`                               | 否   | -                                                     |
| `data.simpleUserIdentify.imageUrl`                 | `string`                                 | 否   | 资源访问链接                                          |
| `data.simpleUserIdentify.imageDesc`                | `string`                                 | 否   | -                                                     |
| `data.simpleUserIdentify.actionUrl`                | `string`                                 | 否   | 资源访问链接                                          |
| `data.blacklist`                                   | `boolean`                                | 否   | -                                                     |
| `data.preferShow`                                  | `number`                                 | 否   | -                                                     |
| `data.showPriMsg`                                  | `boolean`                                | 否   | -                                                     |
| `data.secondaryExpertIdentiy`                      | `Array<SecondaryExpertIdentity>`         | 否   | -                                                     |
| `data.secondaryExpertIdentiy[].expertIdentiyId`    | `number`                                 | 否   | expertIdentiy ID                                      |
| `data.secondaryExpertIdentiy[].expertIdentiyName`  | `string`                                 | 否   | -                                                     |
| `data.secondaryExpertIdentiy[].expertIdentiyCount` | `number`                                 | 否   | -                                                     |
| `data.eventCount`                                  | `number`                                 | 否   | -                                                     |
| `data.user`                                        | `ArtistUser`                             | 否   | 继承自 [PlaylistUser](/api/shared-types#playlistuser) |

<!-- api-doc:response:end -->
