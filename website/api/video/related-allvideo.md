---
title: '相关视频'
description: '调用此接口，可获取相关视频'
---

# 相关视频

调用此接口，可获取相关视频

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                         |
| ---------- | ---------------------------------------------------------- |
| 接口地址   | `/related/allvideo`                                        |
| 请求方式   | `GET` / `POST`                                             |
| 需要登录   | 否                                                         |
| 对应模块   | `related_allvideo`                                         |
| SDK 函数   | `relatedAllvideo`（`hana-music-api/api/related_allvideo`） |
| 返回体类型 | `RelatedAllvideoBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { relatedAllvideo } from 'hana-music-api';

const result = await relatedAllvideo({
  id: '89ADDE33C0AAE8EC14B99F6750DB954D',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/related/allvideo' \
  --data-urlencode 'id=89ADDE33C0AAE8EC14B99F6750DB954D'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明       |
| ---- | ------------------ | ---- | ------ | ---------- |
| `id` | `number \| string` | 是   | -      | 视频 的 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RelatedAllvideoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/related_allvideo`、`hana-music-api/schemas/related_allvideo` 导入运行时校验器）。

```ts
type RelatedAllvideoBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
