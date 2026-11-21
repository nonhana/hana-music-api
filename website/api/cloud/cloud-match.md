---
title: '云盘歌曲信息匹配纠正'
description: '登录后调用此接口，可对云盘歌曲信息匹配纠正，如需取消匹配，asid 需要传 0'
---

# 云盘歌曲信息匹配纠正

登录后调用此接口，可对云盘歌曲信息匹配纠正，如需取消匹配，asid 需要传 0

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/cloud/match`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `cloud_match`                                    |
| SDK 函数   | `cloudMatch`（`hana-music-api/api/cloud_match`） |
| 返回体类型 | `CloudMatchBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { cloudMatch } from 'hana-music-api';

const result = await cloudMatch(
  {
    asid: 1,
    sid: 347230,
    uid: 32953014,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/cloud/match' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'asid=1' \
  --data-urlencode 'sid=347230' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明            |
| ------ | ------------------ | ---- | ------ | --------------- |
| `asid` | `number`           | 是   | -      | 要匹配的歌曲 id |
| `sid`  | `number \| string` | 是   | -      | 云盘的歌曲 id   |
| `uid`  | `number \| string` | 是   | -      | 用户 id         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CloudMatchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/cloud_match`、`hana-music-api/schemas/cloud_match` 导入运行时校验器）。

```ts
type MatchedCloudSong = {
  songId: number;
  addTime?: number | null;
  album?: string | null;
  artist?: string | null;
  bitrate?: number | null;
  cover?: number | null;
  coverId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  lyricId?: string | null;
  matchType?: string | null;
  pcId?: number | null;
  simpleSong?: LooseSong | null;
  songName?: string | null;
  version?: number | null;
};

type CloudMatchBody = {
  code: 200;
  data?: boolean | null;
  matchData: MatchedCloudSong;
  message?: number | null;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)

| 字段        | 类型               | 必填 | 说明                         |
| ----------- | ------------------ | ---- | ---------------------------- |
| `code`      | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`      | `boolean`          | 否   | 接口返回的数据主体           |
| `matchData` | `MatchedCloudSong` | 是   | -                            |
| `message`   | `number`           | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
