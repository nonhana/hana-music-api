---
title: '最近听歌列表'
description: '调用后可获取最近听歌列表'
---

# 最近听歌列表

> 调用后可获取最近听歌列表

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/recent/listen/list` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `recent_listen_list`  |
| 文档分类 | 听歌记录              |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /recent/listen/list
```

## 编程式调用

```ts
import { recentListenList } from 'hana-music-api';

const result = await recentListenList();

console.log(result.body);
```

## 返回内容

`body.code` 和通到最近常听列表的 `body.data` 收紧；`data.resources` 在匿名调用里是 `null`，按可以没有处理，出现时各条记录自己的 `resourceId` 收紧；标题、封面、落地链接和展示字段宽松。结构定义和类型是 `RecentListenListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用后可获取最近听歌列表

**接口地址 :** `/recent/listen/list`
