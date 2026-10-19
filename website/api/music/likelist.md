---
title: '喜欢音乐列表'
description: '调用此接口，传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)'
---

# 喜欢音乐列表

> 调用此接口，传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/likelist`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `likelist`     |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /likelist?uid=32953014
```

## 编程式调用

```ts
import { likelist } from 'hana-music-api';

const result = await likelist({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.ids` 是红心歌曲的编号。结构定义和类型是 `LikelistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)

**必选参数 :** `uid`: 用户 id

**接口地址 :** `/likelist`

**调用例子 :** `/likelist?uid=32953014`
