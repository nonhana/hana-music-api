---
title: '曲风-歌手'
description: '调用此接口可以获取该曲风对应的歌手'
---

# 曲风-歌手

调用此接口可以获取该曲风对应的歌手

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/style/artist`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `style_artist`                                     |
| SDK 函数   | `styleArtist`（`hana-music-api/api/style_artist`） |
| 返回体类型 | `StyleArtistBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { styleArtist } from 'hana-music-api';

const result = await styleArtist({
  tagId: '1000',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/style/artist' \
  --data-urlencode 'tagId=1000'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                           |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------------ |
| `tagId`  | `number \| string` | 是   | -      | 曲风 ID                                                                        |
| `cursor` | `number`           | 否   | `0`    | 返回数据的 cursor，默认为 0，传入上一次返回结果的 cursor，将会返回下一页的数据 |
| `size`   | `number`           | 否   | `20`   | 返回数量，默认为 20                                                            |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StyleArtistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/style_artist`、`hana-music-api/schemas/style_artist` 导入运行时校验器）。

```ts
type StyleArtist = Omit<Artist, 'id' | 'fansCount'> & {
  id: number;
  fansCount?: number | null;
};

type StyleArtistBody = {
  code: 200;
  data: {
    artists: Array<StyleArtist>;
    page?: StylePage | null;
  };
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[StylePage](/api/shared-types#stylepage)

| 字段                       | 类型                                     | 必填 | 说明                         |
| -------------------------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`                     | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                     | `object`                                 | 是   | 接口返回的数据主体           |
| `data.artists`             | `Array<StyleArtist>`                     | 是   | 歌手列表                     |
| `data.artists[].id`        | `number`                                 | 是   | 记录 ID                      |
| `data.artists[].fansCount` | `number`                                 | 否   | -                            |
| `data.page`                | [StylePage](/api/shared-types#stylepage) | 否   | StylePage 实体               |

<!-- api-doc:response:end -->
