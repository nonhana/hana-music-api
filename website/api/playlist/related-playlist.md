---
title: '相关歌单'
description: '原网页抓取接口已失效，建议使用相关歌单推荐接口 `/playlist/detail/rcmd/get`。'
---

# 相关歌单

原网页抓取接口已失效，建议使用相关歌单推荐接口 `/playlist/detail/rcmd/get`。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                         |
| ---------- | ---------------------------------------------------------- |
| 接口地址   | `/related/playlist`                                        |
| 请求方式   | `GET` / `POST`                                             |
| 需要登录   | 否                                                         |
| 对应模块   | `related_playlist`                                         |
| SDK 函数   | `relatedPlaylist`（`hana-music-api/api/related_playlist`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { relatedPlaylist } from 'hana-music-api';

const result = await relatedPlaylist({
  id: '1',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/related/playlist' \
  --data-urlencode 'id=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明        |
| ---- | ------------------ | ---- | ------ | ----------- |
| `id` | `number \| string` | 是   | -      | 目标资源 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **接口状态**：原上游网页抓取来源已失效，建议改用 [相关歌单推荐](/api/playlist/playlist-detail-rcmd-get)。
