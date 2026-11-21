---
title: '歌手分类列表'
description: '调用此接口，可获取歌手分类列表'
---

# 歌手分类列表

调用此接口，可获取歌手分类列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/artist/list`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `artist_list`                                    |
| SDK 函数   | `artistList`（`hana-music-api/api/artist_list`） |
| 返回体类型 | `ArtistListBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistList } from 'hana-music-api';

const result = await artistList({
  type: 1,
  area: 96,
  initial: 'b',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/list' \
  --data-urlencode 'type=1' \
  --data-urlencode 'area=96' \
  --data-urlencode 'initial=b'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型                            | 必填 | 默认值 | 说明                                                                                                                                         |
| --------- | ------------------------------- | ---- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `area`    | `-1 \| 0 \| 7 \| 8 \| 16 \| 96` | 否   | -      | 取值:<br>-1:全部<br>7华语<br>96欧美<br>8:日本<br>16韩国<br>0:其他                                                                            |
| `initial` | `string \| -1`                  | 否   | -      | 按首字母索引查找参数，如 `/artist/list?type=1&area=96&initial=b` 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列，热门传-1，#传 0 |
| `limit`   | `number`                        | 否   | `30`   | 返回数量，默认为 30                                                                                                                          |
| `offset`  | `number`                        | 否   | `0`    | 偏移数量，用于分页，如<br>: 如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0                                                              |
| `type`    | `-1 \| 1 \| 2 \| 3`             | 否   | `1`    | 取值:<br>-1:全部<br>1:男歌手<br>2:女歌手<br>3:乐队                                                                                           |

| `type` | 歌手类型       |
| ------ | -------------- |
| `-1`   | 全部           |
| `1`    | 男歌手（默认） |
| `2`    | 女歌手         |
| `3`    | 乐队/组合      |

| `area` | 地区 |
| ------ | ---- |
| `-1`   | 全部 |
| `7`    | 华语 |
| `96`   | 欧美 |
| `8`    | 日本 |
| `16`   | 韩国 |
| `0`    | 其他 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_list`、`hana-music-api/schemas/artist_list` 导入运行时校验器）。

```ts
type ArtistListItem = Omit<Artist, 'fansCount' | 'id'> & {
  fansCount?: number | null;
  id: number;
};

type ArtistListBody = {
  code: 200;
  artists: Array<ArtistListItem>;
  more?: boolean | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段                  | 类型                    | 必填 | 说明                         |
| --------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `artists`             | `Array<ArtistListItem>` | 是   | 歌手列表                     |
| `artists[].fansCount` | `number`                | 否   | -                            |
| `artists[].id`        | `number`                | 是   | 记录 ID                      |
| `more`                | `boolean`               | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
