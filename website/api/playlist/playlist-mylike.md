---
title: '获取点赞过的视频'
description: '调用此接口, 可获取获取点赞过的视频'
---

# 获取点赞过的视频

> 调用此接口, 可获取获取点赞过的视频

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/mylike` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `playlist_mylike`  |
| 文档分类 | 歌单               |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/mylike
```

## 编程式调用

```ts
import { playlistMylike } from 'hana-music-api';

const result = await playlistMylike();

console.log(result.body);
```

## 返回内容

需要登录：匿名调用会以 `status: 302` 拒绝（录制 `playlist_mylike.anonymous.json`，正文是 `{ code: 302, message: null }`），结构定义只接受 `code: 200`。`body.code` 和 `body.data` 收紧；`message`、`data.more`、`data.time` 宽松。`data.feeds` 在登录录制里只见过空数组（当前账号没有点赞过的视频），元素类型猜不出，没有声明，原样保留；本批录制到的就是空结果（`playlist_mylike.empty.json`），没有发现非空 `feeds` 的可达录制。结构定义和类型是 `PlaylistMylikeBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口, 可获取获取点赞过的视频

**接口地址 :** `/playlist/mylike`

**调用例子 :** `/playlist/mylike`
