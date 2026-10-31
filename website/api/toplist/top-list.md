---
title: '排行榜详情'
description: '请使用[歌单详情](/api/playlist/playlist-detail)接口,传入排行榜 id 获取排行榜详情数据(排行榜也是歌单的一种)'
---

# 排行榜详情

> 请使用[歌单详情](/api/playlist/playlist-detail)接口,传入排行榜 id 获取排行榜详情数据(排行榜也是歌单的一种)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/top/list`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `top_list`     |
| 文档分类 | 排行榜         |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                                                                                                             |
| ---- | ------ | :--: | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `id` | string |  ✅  | -      | 榜单 id,通过所有榜单接口获取~~<br>~~**接口地址 :** `/top/list`~~<br>~~**调用例子 :** `/top/list?id=2809577409`~~ |

## HTTP 示例

```bash
GET /top/list?id=2809577409
```

## 编程式调用

```ts
import { topList } from 'hana-music-api';

const result = await topList({
  id: '2809577409',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.playlist`、`playlist.id`、`playlist.trackIds` 和每项 `trackIds[].id` 收紧；`trackIds` 是调用方要用的 track 引用，按记录编号处理。歌单摘要共用 `PlaylistSummary`，`tracks[]` 里的编号宽松。飙升榜（`19723756`）的 v4 详情只返回 `code` 和 `playlist`，没有顶层 `privileges`；`s` 固定为 `0` 时 `tracks` 仍然返回。`idx` 参数不请求上游，本地返回 `status: 500` 和 `{ code: 500, msg }`，这个拒绝分支也写进了结构定义的联合：`code` 收紧、`msg` 宽松。榜单详情没有空结果，不存在的 id 会得到上游错误。结构定义和类型是 `TopListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 请使用[歌单详情](/api/playlist/playlist-detail)接口,传入排行榜 id 获取排行榜详情数据(排行榜也是歌单的一种)

~~说明 : 调用此接口，传入榜单 id, 可获取不同排行榜数据(v3.34.0 之后不再支持 idx 参数)~~

~~**必选参数 :** `id`: 榜单 id,通过所有榜单接口获取~~

~~**接口地址 :** `/top/list`~~

~~**调用例子 :** `/top/list?id=2809577409`~~
