---
title: '获取每日推荐歌单'
description: '调用此接口，可获得每日推荐歌单 ( 需要登录 )'
---

# 获取每日推荐歌单

调用此接口，可获得每日推荐歌单 ( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/recommend/resource`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 是                                                             |
| 对应模块   | `recommend_resource`                                           |
| SDK 函数   | `recommendResource`（`hana-music-api/api/recommend_resource`） |
| 返回体类型 | `RecommendResourceBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { recommendResource } from 'hana-music-api';

const result = await recommendResource({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/recommend/resource' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RecommendResourceBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/recommend_resource`、`hana-music-api/schemas/recommend_resource` 导入运行时校验器）。

```ts
type RecommendedPlaylist = Omit<
  PlaylistSummary,
  'alg' | 'copywriter' | 'picUrl' | 'playcount' | 'type'
> & {
  alg?: string | null;
  copywriter?: string | null;
  picUrl?: string | null;
  playcount?: number | null;
  type?: number | null;
};

type RecommendResourceBody = {
  code: 200;
  recommend: Array<RecommendedPlaylist>;
  featureFirst?: boolean | null;
  haveRcmdSongs?: boolean | null;
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                     | 类型                         | 必填 | 说明                         |
| ------------------------ | ---------------------------- | ---- | ---------------------------- |
| `code`                   | `200`                        | 是   | 业务状态码（`200` 表示成功） |
| `recommend`              | `Array<RecommendedPlaylist>` | 是   | 推荐条目列表                 |
| `recommend[].alg`        | `string`                     | 否   | 推荐算法标识                 |
| `recommend[].copywriter` | `string`                     | 否   | -                            |
| `recommend[].picUrl`     | `string`                     | 否   | 资源访问链接                 |
| `recommend[].playcount`  | `number`                     | 否   | -                            |
| `recommend[].type`       | `number`                     | 否   | -                            |
| `featureFirst`           | `boolean`                    | 否   | -                            |
| `haveRcmdSongs`          | `boolean`                    | 否   | -                            |

<!-- api-doc:response:end -->
