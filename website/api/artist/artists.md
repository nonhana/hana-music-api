---
title: '获取歌手单曲'
description: '调用此接口，传入歌手 id，可获得歌手部分信息和热门歌曲'
---

# 获取歌手单曲

调用此接口，传入歌手 id，可获得歌手部分信息和热门歌曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                        |
| ---------- | ----------------------------------------- |
| 接口地址   | `/artists`                                |
| 请求方式   | `GET` / `POST`                            |
| 需要登录   | 否                                        |
| 对应模块   | `artists`                                 |
| SDK 函数   | `artists`（`hana-music-api/api/artists`） |
| 返回体类型 | `ArtistsBody`（已建模返回体）             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artists } from 'hana-music-api';

const result = await artists({
  id: '6452',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artists' \
  --data-urlencode 'id=6452'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                      |
| ---- | ------------------ | ---- | ------ | ------------------------- |
| `id` | `number \| string` | 是   | -      | 歌手 id，可由搜索接口获得 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artists`、`hana-music-api/schemas/artists` 导入运行时校验器）。

```ts
type ArtistSummary = Omit<Artist, 'publishTime'> & {
  publishTime?: number | null;
};

type ArtistsBody = {
  code: 200;
  artist?: ArtistSummary | null;
  hotSongs: Array<Song>;
  more?: boolean | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[Song](/api/shared-types#song)

| 字段                 | 类型                                    | 必填 | 说明                         |
| -------------------- | --------------------------------------- | ---- | ---------------------------- |
| `code`               | `200`                                   | 是   | 业务状态码（`200` 表示成功） |
| `artist`             | `ArtistSummary`                         | 否   | 歌手详情                     |
| `artist.publishTime` | `number`                                | 否   | 时间戳                       |
| `hotSongs`           | Array\<[Song](/api/shared-types#song)\> | 是   | Song 列表                    |
| `more`               | `boolean`                               | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
