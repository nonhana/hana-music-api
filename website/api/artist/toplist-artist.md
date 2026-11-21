---
title: '歌手榜'
description: '调用此接口，可获取排行榜中的歌手榜'
---

# 歌手榜

调用此接口，可获取排行榜中的歌手榜

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/toplist/artist`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `toplist_artist`                                       |
| SDK 函数   | `toplistArtist`（`hana-music-api/api/toplist_artist`） |
| 返回体类型 | `ToplistArtistBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { toplistArtist } from 'hana-music-api';

const result = await toplistArtist({
  type: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/toplist/artist' \
  --data-urlencode 'type=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                             |
| ------ | ------------------ | ---- | ------ | ------------------------------------------------ |
| `type` | `1 \| 2 \| 3 \| 4` | 否   | `1`    | 地区<br>1: 华语<br>2: 欧美<br>3: 韩国<br>4: 日本 |

| `type` | 地区分类     |
| ------ | ------------ |
| `1`    | 华语（默认） |
| `2`    | 欧美         |
| `3`    | 韩国         |
| `4`    | 日本         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ToplistArtistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/toplist_artist`、`hana-music-api/schemas/toplist_artist` 导入运行时校验器）。

```ts
type ChartArtist = Omit<Artist, 'id' | 'lastRank' | 'score'> & {
  id: number;
  lastRank?: number | null;
  score?: number | null;
};

type ToplistArtistBody = {
  code: 200;
  list: {
    type?: number | null;
    updateTime?: number | null;
    artists: Array<ChartArtist>;
  };
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段                      | 类型                 | 必填 | 说明                         |
| ------------------------- | -------------------- | ---- | ---------------------------- |
| `code`                    | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `list`                    | `object`             | 是   | 结果条目列表                 |
| `list.type`               | `number`             | 否   | -                            |
| `list.updateTime`         | `number`             | 否   | 时间戳                       |
| `list.artists`            | `Array<ChartArtist>` | 是   | 歌手列表                     |
| `list.artists[].id`       | `number`             | 是   | 记录 ID                      |
| `list.artists[].lastRank` | `number`             | 否   | -                            |
| `list.artists[].score`    | `number`             | 否   | -                            |

<!-- api-doc:response:end -->
