---
title: '已购买单曲'
description: '调用此接口，可获得当前账号已购买单曲'
---

# 已购买单曲

调用此接口，可获得当前账号已购买单曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                               |
| ---------- | ---------------------------------------------------------------- |
| 接口地址   | `/song/singledownlist`                                           |
| 请求方式   | `GET` / `POST`                                                   |
| 需要登录   | 否                                                               |
| 对应模块   | `song_singledownlist`                                            |
| SDK 函数   | `songSingledownlist`（`hana-music-api/api/song_singledownlist`） |
| 返回体类型 | `SongSingledownlistBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songSingledownlist } from 'hana-music-api';

const result = await songSingledownlist({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/singledownlist' \
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

返回体类型：`SongSingledownlistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_singledownlist`、`hana-music-api/schemas/song_singledownlist` 导入运行时校验器）。

```ts
type SongSingledownlistBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
