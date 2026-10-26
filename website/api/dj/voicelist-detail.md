---
title: '播客列表详情'
description: '可以获取播客封面、分类、名称、简介等'
---

# 播客列表详情

> 可以获取播客封面、分类、名称、简介等

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/voicelist/detail` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 是                  |
| 对应模块 | `voicelist_detail`  |
| 文档分类 | 电台与播客          |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voicelist/detail
```

## 编程式调用

```ts
import { voicelistDetail } from 'hana-music-api';

const result = await voicelistDetail();

console.log(result.body);
```

## 返回内容

工作台接口只允许读取自己的播客。当前账号没有播客，不存在的 id 返回 `code: 400`（`播客不存在`），读取他人的公开播客返回 `code: 400`（`只允许操作自己的播客`），没有录到带字段的成功正文；SDK 暂不为该模块声明结构定义，`body` 原样返回网易云正文。

## 补充说明

说明: 可以获取播客封面、分类、名称、简介等

**接口地址:** `/voicelist/detail`

**必选参数：**

`id`: 播客id，即voiceListId
