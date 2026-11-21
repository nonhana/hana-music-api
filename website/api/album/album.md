---
title: '获取专辑内容'
description: '调用此接口，传入专辑 id，可获得专辑内容'
---

# 获取专辑内容

调用此接口，传入专辑 id，可获得专辑内容

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                    |
| ---------- | ------------------------------------- |
| 接口地址   | `/album`                              |
| 请求方式   | `GET` / `POST`                        |
| 需要登录   | 否                                    |
| 对应模块   | `album`                               |
| SDK 函数   | `album`（`hana-music-api/api/album`） |
| 返回体类型 | `AlbumBody`（已建模返回体）           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { album } from 'hana-music-api';

const result = await album({
  id: '32311',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album' \
  --data-urlencode 'id=32311'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 专辑 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album`、`hana-music-api/schemas/album` 导入运行时校验器）。

```ts
type AlbumBody = {
  code: 200;
  songs: Array<Song>;
  album: AlbumSummary;
  resourceState?: boolean | null;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)、[Song](/api/shared-types#song)

| 字段            | 类型                                           | 必填 | 说明                         |
| --------------- | ---------------------------------------------- | ---- | ---------------------------- |
| `code`          | `200`                                          | 是   | 业务状态码（`200` 表示成功） |
| `songs`         | Array\<[Song](/api/shared-types#song)\>        | 是   | 歌曲列表                     |
| `album`         | [AlbumSummary](/api/shared-types#albumsummary) | 是   | 专辑信息                     |
| `resourceState` | `boolean`                                      | 否   | -                            |

<!-- api-doc:response:end -->
