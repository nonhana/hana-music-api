---
title: '获取歌手描述'
description: '调用此接口，传入歌手 id，可获得歌手描述'
---

# 获取歌手描述

调用此接口，传入歌手 id，可获得歌手描述

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/artist/desc`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `artist_desc`                                    |
| SDK 函数   | `artistDesc`（`hana-music-api/api/artist_desc`） |
| 返回体类型 | `ArtistDescBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistDesc } from 'hana-music-api';

const result = await artistDesc({
  id: '6452',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/desc' \
  --data-urlencode 'id=6452'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌手 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistDescBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_desc`、`hana-music-api/schemas/artist_desc` 导入运行时校验器）。

```ts
type Introduction = {
  ti?: string | null;
  txt?: string | null;
};

type TopicCreator = Omit<
  PlaylistUser,
  | 'accountType'
  | 'authenticated'
  | 'createTime'
  | 'lastLoginIP'
  | 'lastLoginTime'
  | 'locationStatus'
  | 'shortUserName'
  | 'userName'
  | 'viptypeVersion'
> & {
  accountType?: number | null;
  authenticated?: boolean | null;
  createTime?: number | null;
  lastLoginIP?: string | null;
  lastLoginTime?: number | null;
  locationStatus?: number | null;
  shortUserName?: string | null;
  userName?: string | null;
  viptypeVersion?: number | null;
};

type TopicContent = {
  content?: string | null;
  id?: number | null;
  type?: number | null;
};

type Topic = {
  addTime?: number | null;
  adInfo?: string | null;
  auditor?: string | null;
  auditStatus?: number | null;
  auditTime?: number | null;
  categoryId?: number | null;
  content?: Array<TopicContent> | null;
  cover?: number | null;
  delReason?: string | null;
  fromBackend?: boolean | null;
  headPic?: number | null;
  hotScore?: number | null;
  id?: number | null;
  mainTitle?: string | null;
  memo?: string | null;
  number?: number | null;
  pubImmidiatly?: boolean | null;
  pubTime?: number | null;
  readCount?: number | null;
  recomdContent?: string | null;
  recomdTitle?: string | null;
  rectanglePic?: number | null;
  reward?: boolean | null;
  seriesId?: number | null;
  shareContent?: string | null;
  showComment?: boolean | null;
  showRelated?: boolean | null;
  startText?: string | null;
  status?: number | null;
  summary?: string | null;
  tags?: Array<string> | null;
  title?: string | null;
  updateTime?: number | null;
  userId?: number | null;
  wxTitle?: string | null;
};

type TopicArticle = {
  addTime?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
  commentCount?: number | null;
  commentThreadId?: string | null;
  coverUrl?: string | null;
  creator?: TopicCreator | null;
  id?: number | null;
  liked?: boolean | null;
  likedCount?: number | null;
  mainTitle?: string | null;
  memo?: string | null;
  number?: number | null;
  readCount?: number | null;
  recmdContent?: string | null;
  recmdTitle?: string | null;
  rectanglePicUrl?: string | null;
  reward?: boolean | null;
  rewardCount?: number | null;
  rewardMoney?: number | null;
  seriesId?: number | null;
  shareContent?: string | null;
  shareCount?: number | null;
  showComment?: boolean | null;
  showRelated?: boolean | null;
  summary?: string | null;
  tags?: Array<string> | null;
  title?: string | null;
  topic?: Topic | null;
  url?: string | null;
  wxTitle?: string | null;
};

type ArtistDescBody = {
  code: 200;
  briefDesc?: string | null;
  count?: number | null;
  introduction: Array<Introduction>;
  topicData?: Array<TopicArticle> | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段                 | 类型                  | 必填 | 说明                         |
| -------------------- | --------------------- | ---- | ---------------------------- |
| `code`               | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `briefDesc`          | `string`              | 否   | -                            |
| `count`              | `number`              | 否   | 条目总数                     |
| `introduction`       | `Array<Introduction>` | 是   | -                            |
| `introduction[].ti`  | `string`              | 否   | -                            |
| `introduction[].txt` | `string`              | 否   | -                            |
| `topicData`          | `Array<TopicArticle>` | 否   | -                            |

<!-- api-doc:response:end -->
