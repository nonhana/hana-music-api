---
title: '获取歌手 mv'
description: '调用此接口，传入歌手 id，可获得歌手 mv 信息，具体 mv 播放地址可调'
---

# 获取歌手 mv

调用此接口，传入歌手 id，可获得歌手 mv 信息，具体 mv 播放地址可调

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/artist/mv`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `artist_mv`                                  |
| SDK 函数   | `artistMv`（`hana-music-api/api/artist_mv`） |
| 返回体类型 | `ArtistMvBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistMv } from 'hana-music-api';

const result = await artistMv({
  id: '6452',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/mv' \
  --data-urlencode 'id=6452'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                         |
| -------- | ------------------ | ---- | ------ | ---------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌手 id，可由搜索接口获得    |
| `limit`  | `number`           | 否   | -      | 返回数量，默认 `30`          |
| `offset` | `number`           | 否   | -      | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistMvBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_mv`、`hana-music-api/schemas/artist_mv` 导入运行时校验器）。

```ts
type Mv = {
  artist?: Artist | null;
  artistName?: string | null;
  duration?: number | null;
  id: number;
  imgurl?: string | null;
  imgurl16v9?: string | null;
  name?: string | null;
  playCount?: number | null;
  publishTime?: string | null;
  status?: number | null;
  subed?: boolean | null;
};

type ArtistMvBody = {
  code: 200;
  hasMore?: boolean | null;
  mvs: Array<Mv>;
  time?: number | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段                | 类型                               | 必填 | 说明                         |
| ------------------- | ---------------------------------- | ---- | ---------------------------- |
| `code`              | `200`                              | 是   | 业务状态码（`200` 表示成功） |
| `hasMore`           | `boolean`                          | 否   | 是否还有更多数据             |
| `mvs`               | `Array<Mv>`                        | 是   | MV 列表                      |
| `mvs[].artist`      | [Artist](/api/shared-types#artist) | 否   | 歌手详情                     |
| `mvs[].artistName`  | `string`                           | 否   | 歌手名称                     |
| `mvs[].duration`    | `number`                           | 否   | 时长（毫秒）                 |
| `mvs[].id`          | `number`                           | 是   | 记录 ID                      |
| `mvs[].imgurl`      | `string`                           | 否   | 资源访问链接                 |
| `mvs[].imgurl16v9`  | `string`                           | 否   | -                            |
| `mvs[].name`        | `string`                           | 否   | 名称                         |
| `mvs[].playCount`   | `number`                           | 否   | 播放次数                     |
| `mvs[].publishTime` | `string`                           | 否   | 时间戳                       |
| `mvs[].status`      | `number`                           | 否   | -                            |
| `mvs[].subed`       | `boolean`                          | 否   | 是否已收藏/订阅              |
| `time`              | `number`                           | 否   | 时间戳                       |

<!-- api-doc:response:end -->
