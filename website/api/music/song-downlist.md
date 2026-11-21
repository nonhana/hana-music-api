---
title: '会员下载歌曲记录'
description: '调用此接口，可获得当前账号会员下载歌曲记录'
---

# 会员下载歌曲记录

调用此接口，可获得当前账号会员下载歌曲记录

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/song/downlist`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `song_downlist`                                      |
| SDK 函数   | `songDownlist`（`hana-music-api/api/song_downlist`） |
| 返回体类型 | `SongDownlistBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songDownlist } from 'hana-music-api';

const result = await songDownlist({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/downlist' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                     |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------ |
| `limit`  | `number` | 否   | `20`   | 返回数量，默认为 20                                                      |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页 ，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongDownlistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_downlist`、`hana-music-api/schemas/song_downlist` 导入运行时校验器）。

```ts
type DownloadRecord = {
  firstTime?: number | null;
  id: number;
  song?: LooseSong | null;
  type?: number | null;
};

type SongDownlistBody = {
  code: 200;
  info: Array<DownloadRecord>;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)

| 字段               | 类型                                     | 必填 | 说明                         |
| ------------------ | ---------------------------------------- | ---- | ---------------------------- |
| `code`             | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `info`             | `Array<DownloadRecord>`                  | 是   | -                            |
| `info[].firstTime` | `number`                                 | 否   | 时间戳                       |
| `info[].id`        | `number`                                 | 是   | 记录 ID                      |
| `info[].song`      | [LooseSong](/api/shared-types#loosesong) | 否   | LooseSong 实体               |
| `info[].type`      | `number`                                 | 否   | -                            |

<!-- api-doc:response:end -->
