---
title: '收藏视频'
description: '调用此接口，可收藏视频'
---

# 收藏视频

调用此接口，可收藏视频

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/video/sub`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 是                                           |
| 对应模块   | `video_sub`                                  |
| SDK 函数   | `videoSub`（`hana-music-api/api/video_sub`） |
| 返回体类型 | `VideoSubBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoSub } from 'hana-music-api';

const result = await videoSub(
  {
    id: 'example',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/video/sub' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=example'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型     | 必填 | 默认值 | 说明                     |
| ---- | -------- | ---- | ------ | ------------------------ |
| `id` | `string` | 是   | -      | 视频 id                  |
| `t`  | `0 \| 1` | 否   | -      | 1 为收藏，其他为取消收藏 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoSubBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_sub`、`hana-music-api/schemas/video_sub` 导入运行时校验器）。

```ts
type VideoSubBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
