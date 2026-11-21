---
title: '歌手粉丝数量'
description: '调用此接口，传入歌手 id，可获取歌手粉丝数量'
---

# 歌手粉丝数量

调用此接口，传入歌手 id，可获取歌手粉丝数量

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/artist/follow/count`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 否                                                              |
| 对应模块   | `artist_follow_count`                                           |
| SDK 函数   | `artistFollowCount`（`hana-music-api/api/artist_follow_count`） |
| 返回体类型 | `ArtistFollowCountBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistFollowCount } from 'hana-music-api';

const result = await artistFollowCount({
  id: '2116',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/follow/count' \
  --data-urlencode 'id=2116'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌手 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistFollowCountBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_follow_count`、`hana-music-api/schemas/artist_follow_count` 导入运行时校验器）。

```ts
type ArtistFollowCountBody = {
  code: 200;
  message?: string | null;
  data: {
    fansCnt?: number | null;
    follow?: boolean | null;
    followCnt?: number | null;
    followDay?: string | null;
    followDayCnt?: number | null;
    isFollow?: boolean | null;
  };
};
```

| 字段                | 类型      | 必填 | 说明                         |
| ------------------- | --------- | ---- | ---------------------------- |
| `code`              | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `message`           | `string`  | 否   | 返回说明信息                 |
| `data`              | `object`  | 是   | 接口返回的数据主体           |
| `data.fansCnt`      | `number`  | 否   | -                            |
| `data.follow`       | `boolean` | 否   | -                            |
| `data.followCnt`    | `number`  | 否   | -                            |
| `data.followDay`    | `string`  | 否   | -                            |
| `data.followDayCnt` | `number`  | 否   | -                            |
| `data.isFollow`     | `boolean` | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **未知歌手**：传入未知歌手 ID 时上游返回 `code: 404` 且 `data` 为 `null`。
