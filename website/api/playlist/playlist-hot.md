---
title: '热门歌单分类'
description: '调用此接口,可获取歌单分类,包含 category 信息'
---

# 热门歌单分类

> 调用此接口,可获取歌单分类,包含 category 信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/playlist/hot` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `playlist_hot`  |
| 文档分类 | 歌单            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/hot
```

## 编程式调用

```ts
import { playlistHot } from 'hana-music-api';

const result = await playlistHot();

console.log(result.body);
```

## 返回内容

`body.code`、`body.tags` 和每个标签的编号 `tags[].id` 收紧；`name`、`category`、`type`、`position`、`createTime`、`usedCount`、`hot`、`activity` 和嵌套的 `playlistTag`（其中的 `id` 也宽松）都是宽松字段。本批录制与探测未发现可达的空结果，数组本身允许为空；非 null 路径与类型相同；登录只在宽松字段上多出现 null 或不同值，登录对照录制已删除。结构定义和类型是 `PlaylistHotBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取歌单分类,包含 category 信息

**接口地址 :** `/playlist/hot`

**调用例子 :** `/playlist/hot`
