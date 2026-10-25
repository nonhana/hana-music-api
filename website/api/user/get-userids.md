---
title: '根据nickname获取userid'
description: '使用此接口,传入用户昵称,可获取对应的用户id,支持批量获取,多个昵称用`分号(;)`隔开'
---

# 根据nickname获取userid

> 使用此接口,传入用户昵称,可获取对应的用户id,支持批量获取,多个昵称用`分号(;)`隔开

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/get/userids` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `get_userids`  |
| 文档分类 | 用户与登录     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /get/userids?nicknames=binaryify
GET /get/userids?nicknames=binaryify;binaryify2
```

## 编程式调用

```ts
import { getUserids } from 'hana-music-api';

const result = await getUserids({
  nicknames: 'binaryify',
});

console.log(result.body);
```

## 返回内容

昵称到 user id 的映射在 `nicknames`，没有匹配的昵称时是空对象，不存在的昵称不会出现在映射里。`code` 和 `nicknames` 收紧，映射值必须是数字。结构定义和类型是 `GetUseridsBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 使用此接口,传入用户昵称,可获取对应的用户id,支持批量获取,多个昵称用`分号(;)`隔开

**必选参数：**

`nicknames`: 用户昵称,多个用分号(;)隔开

**接口地址:** `/get/userids`

**调用例子:** `/get/userids?nicknames=binaryify` `/get/userids?nicknames=binaryify;binaryify2`
