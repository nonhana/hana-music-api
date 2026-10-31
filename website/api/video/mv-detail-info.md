---
title: '获取 mv 点赞转发评论数数据'
description: '调用此接口，传入 mvid ( 在搜索音乐的时候传 type=1004 获得 )，可获取对应'
---

# 获取 mv 点赞转发评论数数据

> 调用此接口，传入 mvid ( 在搜索音乐的时候传 type=1004 获得 )，可获取对应

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/mv/detail/info` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `mv_detail_info`  |
| 文档分类 | 视频与 MV         |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明     |
| ------ | ------ | :--: | ------ | -------- |
| `mvid` | string |  ✅  | -      | mv 的 id |

## HTTP 示例

```bash
GET /mv/detail/info?mvid=5436712
```

## 编程式调用

```ts
import { mvDetailInfo } from 'hana-music-api';

const result = await mvDetailInfo({
  mvid: '5436712',
});

console.log(result.body);
```

## 返回内容

接口要返回的评论数 `commentCount`、转发数 `shareCount`、点赞数 `likedCount` 和 `code` 收紧；当前账号的点赞状态 `liked` 是宽松字段。给出非原始值的 `mvid` 会在本地返回 400，不请求上游。结构定义和类型是 `MvDetailInfoBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入 mvid ( 在搜索音乐的时候传 type=1004 获得 )，可获取对应
MV 点赞转发评论数数据

**必选参数 :** `mvid`: mv 的 id

**接口地址 :** `/mv/detail/info`

**调用例子 :** `/mv/detail/info?mvid=5436712`
