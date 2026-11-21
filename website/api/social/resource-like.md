---
title: '资源点赞( MV,电台,视频)'
description: '调用此接口，可对 MV，电台，视频点赞'
---

# 资源点赞( MV,电台,视频)

调用此接口，可对 MV，电台，视频点赞

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/resource/like`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `resource_like`                                      |
| SDK 函数   | `resourceLike`（`hana-music-api/api/resource_like`） |
| 返回体类型 | `ResourceLikeBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { resourceLike } from 'hana-music-api';

const result = await resourceLike(
  {
    t: 1,
    type: 1,
    id: '5436712',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/resource/like' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 't=1' \
  --data-urlencode 'type=1' \
  --data-urlencode 'id=5436712'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                                                                                                             |
| ---------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `id`       | `number \| string` | 是   | -      | 资源 id                                                                                                          |
| `type`     | `number`           | 是   | -      | 资源类型，对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |
| `t`        | `0 \| 1`           | 是   | -      | 操作，1 为点赞，其他为取消点赞                                                                                   |
| `threadId` | `string`           | 否   | -      | 动态资源线程 ID（点赞动态 `type=6` 时使用）                                                                      |

| `type` | 资源类型                          |
| ------ | --------------------------------- |
| `0`    | 歌曲                              |
| `1`    | MV                                |
| `2`    | 歌单                              |
| `3`    | 专辑                              |
| `4`    | 电台节目                          |
| `5`    | 视频                              |
| `6`    | 动态（部分接口需改传 `threadId`） |
| `7`    | 电台                              |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ResourceLikeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/resource_like`、`hana-music-api/schemas/resource_like` 导入运行时校验器）。

```ts
type ResourceLikeBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->

## 注意事项

- **动态点赞**：当 `type=6`（动态）时，需传入动态的 `threadId`（可从动态接口获取）。
