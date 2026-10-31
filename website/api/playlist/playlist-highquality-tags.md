---
title: '精品歌单标签列表'
description: '调用此接口，可获取精品歌单标签列表'
---

# 精品歌单标签列表

> 调用此接口，可获取精品歌单标签列表

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/playlist/highquality/tags` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `playlist_highquality_tags`  |
| 文档分类 | 歌单                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/highquality/tags
```

## 编程式调用

```ts
import { playlistHighqualityTags } from 'hana-music-api';

const result = await playlistHighqualityTags();

console.log(result.body);
```

## 返回内容

`body.code`、`body.tags` 和每个标签的编号 `tags[].id` 收紧；`name`、`type`、`category`、`hot` 宽松。本批录制与探测未发现可达的空结果，数组本身允许为空；非 null 路径与类型相同；登录只在宽松字段上多出现 null 或不同值，登录对照录制已删除。结构定义和类型是 `PlaylistHighqualityTagsBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取精品歌单标签列表

**接口地址 :** `/playlist/highquality/tags`

**调用例子 :** `/playlist/highquality/tags`
