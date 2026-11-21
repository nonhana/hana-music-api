---
title: '关注歌手新 MV'
description: '登录后调用此接口可获取关注歌手新 MV'
---

# 关注歌手新 MV

登录后调用此接口可获取关注歌手新 MV

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                  |
| ---------- | --------------------------------------------------- |
| 接口地址   | `/artist/new/mv`                                    |
| 请求方式   | `GET` / `POST`                                      |
| 需要登录   | 是                                                  |
| 对应模块   | `artist_new_mv`                                     |
| SDK 函数   | `artistNewMv`（`hana-music-api/api/artist_new_mv`） |
| 返回体类型 | `ArtistNewMvBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistNewMv } from 'hana-music-api';

const result = await artistNewMv(
  {
    limit: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/new/mv' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值     | 说明                                |
| -------- | -------- | ---- | ---------- | ----------------------------------- |
| `before` | `number` | 否   | 当前时间戳 | 上一页数据返回的 publishTime 的数据 |
| `limit`  | `number` | 否   | `20`       | 取出评论数量，默认为 20             |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistNewMvBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_new_mv`、`hana-music-api/schemas/artist_new_mv` 导入运行时校验器）。

```ts
type NewMv = {
  artistId?: number | null;
  artistImgUrl?: string | null;
  artistName?: string | null;
  artisAlias?: string | null;
  artisTransName?: string | null;
  duration?: number | null;
  mvCoverUrl?: string | null;
  mvId: number;
  mvName?: string | null;
  playCount?: number | null;
  publishDate?: string | null;
  publishTime?: number | null;
};

type ArtistNewMvBody = {
  code: 200;
  message?: string | null;
  data: {
    hasMore?: boolean | null;
    newWorks: Array<NewMv>;
  };
};
```

| 字段                             | 类型           | 必填 | 说明                         |
| -------------------------------- | -------------- | ---- | ---------------------------- |
| `code`                           | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `message`                        | `string`       | 否   | 返回说明信息                 |
| `data`                           | `object`       | 是   | 接口返回的数据主体           |
| `data.hasMore`                   | `boolean`      | 否   | 是否还有更多数据             |
| `data.newWorks`                  | `Array<NewMv>` | 是   | -                            |
| `data.newWorks[].artistId`       | `number`       | 否   | 歌手 ID                      |
| `data.newWorks[].artistImgUrl`   | `string`       | 否   | 资源访问链接                 |
| `data.newWorks[].artistName`     | `string`       | 否   | 歌手名称                     |
| `data.newWorks[].artisAlias`     | `string`       | 否   | -                            |
| `data.newWorks[].artisTransName` | `string`       | 否   | -                            |
| `data.newWorks[].duration`       | `number`       | 否   | 时长（毫秒）                 |
| `data.newWorks[].mvCoverUrl`     | `string`       | 否   | 资源访问链接                 |
| `data.newWorks[].mvId`           | `number`       | 是   | MV ID                        |
| `data.newWorks[].mvName`         | `string`       | 否   | -                            |
| `data.newWorks[].playCount`      | `number`       | 否   | 播放次数                     |
| `data.newWorks[].publishDate`    | `string`       | 否   | -                            |
| `data.newWorks[].publishTime`    | `number`       | 否   | 时间戳                       |

<!-- api-doc:response:end -->
