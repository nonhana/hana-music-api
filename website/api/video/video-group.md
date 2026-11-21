---
title: '获取视频标签/分类下的视频'
description: '调用此接口，传入标签/分类`id`，可获取到相关的视频，分页参数只能传入 offset'
---

# 获取视频标签/分类下的视频

调用此接口，传入标签/分类`id`，可获取到相关的视频，分页参数只能传入 offset

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/video/group`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `video_group`                                    |
| SDK 函数   | `videoGroup`（`hana-music-api/api/video_group`） |
| 返回体类型 | `VideoGroupBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoGroup } from 'hana-music-api';

const result = await videoGroup({
  id: '9104',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/video/group' \
  --data-urlencode 'id=9104'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明             |
| -------- | ------------------ | ---- | ------ | ---------------- |
| `id`     | `number \| string` | 是   | -      | videoGroup 的 id |
| `offset` | `number`           | 否   | `0`    | 默认 0           |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoGroupBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_group`、`hana-music-api/schemas/video_group` 导入运行时校验器）。

```ts
type VideoGroupBody = {
  code: 200;
  hasmore?: boolean | null;
  rcmdLimit?: number | null;
};
```

| 字段        | 类型      | 必填 | 说明                         |
| ----------- | --------- | ---- | ---------------------------- |
| `code`      | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `hasmore`   | `boolean` | 否   | -                            |
| `rcmdLimit` | `number`  | 否   | -                            |

<!-- api-doc:response:end -->
