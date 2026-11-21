---
title: '最新专辑'
description: '调用此接口 ，获取云音乐首页新碟上架数据'
---

# 最新专辑

调用此接口 ，获取云音乐首页新碟上架数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/album/newest`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `album_newest`                                     |
| SDK 函数   | `albumNewest`（`hana-music-api/api/album_newest`） |
| 返回体类型 | `AlbumNewestBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumNewest } from 'hana-music-api';

const result = await albumNewest();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/album/newest'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumNewestBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_newest`、`hana-music-api/schemas/album_newest` 导入运行时校验器）。

```ts
type AlbumNewestBody = {
  code: 200;
  albums: Array<AlbumSummary>;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)

| 字段     | 类型                                                    | 必填 | 说明                         |
| -------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`   | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `albums` | Array\<[AlbumSummary](/api/shared-types#albumsummary)\> | 是   | 专辑列表                     |

<!-- api-doc:response:end -->
