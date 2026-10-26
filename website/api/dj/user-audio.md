---
title: '用户电台'
description: '调用此接口, 传入用户 id 可获取用户创建的电台'
---

# 用户电台

> 调用此接口, 传入用户 id 可获取用户创建的电台

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/audio`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `user_audio`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/audio?uid=32953014
```

## 编程式调用

```ts
import { userAudio } from 'hana-music-api';

const result = await userAudio({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到用户创建电台列表的 `body.djRadios` 和每条电台自己的编号 `djRadios[].id` 收紧；`dj` 主播复用宽松的 `PlaylistUser`，电台的简介、封面、分类、价格、计数、`lastProgram*`、`rcmdtext`、`privacy`、`underShelf` 等展示字段宽松，`descPicList`、`discountPrice`、`icon`、`liveInfo`、`manualTagsDTO`、`replaceRadio`、`shortName`、`videos` 只见过 `null`，没有声明。`count`、`subCount`、`hasMore` 是宽松的计数与分页提示。用户没有创建电台时 `djRadios` 是空数组。结构定义和类型是 `UserAudioBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口, 传入用户 id 可获取用户创建的电台

**必选参数 :** `uid`: 用户 id

**接口地址 :** `/user/audio`

**调用例子 :** `/user/audio?uid=32953014`
