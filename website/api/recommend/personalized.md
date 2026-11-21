---
title: '推荐歌单'
description: '调用此接口，可获取推荐歌单'
---

# 推荐歌单

调用此接口，可获取推荐歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                  |
| ---------- | --------------------------------------------------- |
| 接口地址   | `/personalized`                                     |
| 请求方式   | `GET` / `POST`                                      |
| 需要登录   | 否                                                  |
| 对应模块   | `personalized`                                      |
| SDK 函数   | `personalized`（`hana-music-api/api/personalized`） |
| 返回体类型 | `PersonalizedBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalized } from 'hana-music-api';

const result = await personalized({
  limit: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/personalized' \
  --data-urlencode 'limit=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                                |
| ------- | -------- | ---- | ------ | ----------------------------------- |
| `limit` | `number` | 否   | `30`   | 取出数量，默认为 30 (不支持 offset) |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalizedBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personalized`、`hana-music-api/schemas/personalized` 导入运行时校验器）。

```ts
type RecommendedPlaylist = Omit<
  PlaylistSummary,
  'alg' | 'canDislike' | 'copywriter' | 'picUrl' | 'type'
> & {
  alg?: string | null;
  canDislike?: boolean | null;
  copywriter?: string | null;
  picUrl?: string | null;
  type?: number | null;
};

type PersonalizedBody = {
  code: 200;
  result: Array<RecommendedPlaylist>;
  category?: number | null;
  hasTaste?: boolean | null;
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                  | 类型                         | 必填 | 说明                         |
| --------------------- | ---------------------------- | ---- | ---------------------------- |
| `code`                | `200`                        | 是   | 业务状态码（`200` 表示成功） |
| `result`              | `Array<RecommendedPlaylist>` | 是   | 接口返回的结果主体           |
| `result[].alg`        | `string`                     | 否   | 推荐算法标识                 |
| `result[].canDislike` | `boolean`                    | 否   | -                            |
| `result[].copywriter` | `string`                     | 否   | -                            |
| `result[].picUrl`     | `string`                     | 否   | 资源访问链接                 |
| `result[].type`       | `number`                     | 否   | -                            |
| `category`            | `number`                     | 否   | -                            |
| `hasTaste`            | `boolean`                    | 否   | -                            |

<!-- api-doc:response:end -->
