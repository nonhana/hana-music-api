---
title: '歌单详情动态'
description: '调用后可获取歌单详情动态部分,如评论数,是否收藏,播放数'
---

# 歌单详情动态

> 调用后可获取歌单详情动态部分,如评论数,是否收藏,播放数

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/playlist/detail/dynamic` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 否                         |
| 对应模块 | `playlist_detail_dynamic`  |
| 文档分类 | 歌单                       |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌单 id |

## HTTP 示例

```bash
GET /playlist/detail/dynamic?id=24381616
```

## 编程式调用

```ts
import { playlistDetailDynamic } from 'hana-music-api';

const result = await playlistDetailDynamic({
  id: '24381616',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧；`bookedCount`、`commentCount`、`followed`、`gradeStatus`、`playCount`、`shareCount`、`subscribed` 是宽松字段，`remarkName`、`remixVideo` 在录制里只见过 `null`，没有声明，原样保留。正文没有列表，本批录制与探测未发现可达的空结果；非 null 路径与类型相同；登录探测只在宽松字段上出现不同值（`subscribed` 从 `false` 变成 `true`），登录对照录制已删除。结构定义和类型是 `PlaylistDetailDynamicBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用后可获取歌单详情动态部分,如评论数,是否收藏,播放数

**必选参数 :** `id` : 歌单 id

**接口地址 :** `/playlist/detail/dynamic`

**调用例子 :** `/playlist/detail/dynamic?id=24381616`
