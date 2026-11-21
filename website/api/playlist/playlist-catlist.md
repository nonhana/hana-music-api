---
title: '歌单分类'
description: '调用此接口，可获取歌单分类，包含 category 信息'
---

# 歌单分类

调用此接口，可获取歌单分类，包含 category 信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                         |
| ---------- | ---------------------------------------------------------- |
| 接口地址   | `/playlist/catlist`                                        |
| 请求方式   | `GET` / `POST`                                             |
| 需要登录   | 否                                                         |
| 对应模块   | `playlist_catlist`                                         |
| SDK 函数   | `playlistCatlist`（`hana-music-api/api/playlist_catlist`） |
| 返回体类型 | `PlaylistCatlistBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistCatlist } from 'hana-music-api';

const result = await playlistCatlist();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/catlist'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistCatlistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_catlist`、`hana-music-api/schemas/playlist_catlist` 导入运行时校验器）。

```ts
type Category = {
  activity?: boolean | null;
  category?: number | null;
  hot?: boolean | null;
  imgId?: number | null;
  name: string;
  resourceCount?: number | null;
  resourceType?: number | null;
  type?: number | null;
};

type PlaylistCatlistBody = {
  code: 200;
  all: Category;
  categories: Record<string, string>;
  sub: Array<Category>;
};
```

| 字段                  | 类型                     | 必填 | 说明                         |
| --------------------- | ------------------------ | ---- | ---------------------------- |
| `code`                | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `all`                 | `Category`               | 是   | -                            |
| `all.activity`        | `boolean`                | 否   | -                            |
| `all.category`        | `number`                 | 否   | -                            |
| `all.hot`             | `boolean`                | 否   | -                            |
| `all.imgId`           | `number`                 | 否   | img ID                       |
| `all.name`            | `string`                 | 是   | 名称                         |
| `all.resourceCount`   | `number`                 | 否   | -                            |
| `all.resourceType`    | `number`                 | 否   | -                            |
| `all.type`            | `number`                 | 否   | -                            |
| `categories`          | `Record<string, string>` | 是   | -                            |
| `sub`                 | `Array<Category>`        | 是   | -                            |
| `sub[].activity`      | `boolean`                | 否   | -                            |
| `sub[].category`      | `number`                 | 否   | -                            |
| `sub[].hot`           | `boolean`                | 否   | -                            |
| `sub[].imgId`         | `number`                 | 否   | img ID                       |
| `sub[].name`          | `string`                 | 是   | 名称                         |
| `sub[].resourceCount` | `number`                 | 否   | -                            |
| `sub[].resourceType`  | `number`                 | 否   | -                            |
| `sub[].type`          | `number`                 | 否   | -                            |

<!-- api-doc:response:end -->
