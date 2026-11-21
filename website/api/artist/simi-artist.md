---
title: '获取相似歌手'
description: '调用此接口，传入歌手 id，可获得相似歌手'
---

# 获取相似歌手

调用此接口，传入歌手 id，可获得相似歌手

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/simi/artist`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `simi_artist`                                    |
| SDK 函数   | `simiArtist`（`hana-music-api/api/simi_artist`） |
| 返回体类型 | `SimiArtistBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { simiArtist } from 'hana-music-api';

const result = await simiArtist({
  id: '6452',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/simi/artist' \
  --data-urlencode 'id=6452'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌手 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SimiArtistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/simi_artist`、`hana-music-api/schemas/simi_artist` 导入运行时校验器）。

```ts
type SimiArtist = Omit<Artist, 'id' | 'alg' | 'fansCount'> & {
  id: number;
  alg?: string | null;
  fansCount?: number | null;
};

type SimiArtistBody = {
  code: 200;
  artists: Array<SimiArtist>;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段                  | 类型                | 必填 | 说明                         |
| --------------------- | ------------------- | ---- | ---------------------------- |
| `code`                | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `artists`             | `Array<SimiArtist>` | 是   | 歌手列表                     |
| `artists[].id`        | `number`            | 是   | 记录 ID                      |
| `artists[].alg`       | `string`            | 否   | 推荐算法标识                 |
| `artists[].fansCount` | `number`            | 否   | -                            |

<!-- api-doc:response:end -->
