---
title: '获取用户等级信息'
description: '登录后调用此接口，可以获取用户等级信息,包含当前登录天数,听歌次数,下一等级需要的登录天数和听歌次数,当前等级进度,对应 https://music.163.com/#/user/level'
---

# 获取用户等级信息

> 登录后调用此接口，可以获取用户等级信息,包含当前登录天数,听歌次数,下一等级需要的登录天数和听歌次数,当前等级进度,对应 <https://music.163.com/#/user/level>

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/level`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_level`   |
| 文档分类 | 用户与登录     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/level
```

## 编程式调用

```ts
import { userLevel } from 'hana-music-api';

const result = await userLevel();

console.log(result.body);
```

## 返回内容

等级信息在 `data`，`data.level` 是当前等级、`data.userId` 是账号自己的编号；`code`、`data`、`data.userId`、`data.level` 收紧。`info`、`progress`、`nowPlayCount`、`nowLoginCount`、`nextPlayCount`、`nextLoginCount` 和顶层的 `full` 宽松。结构定义和类型是 `UserLevelBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可以获取用户等级信息,包含当前登录天数,听歌次数,下一等级需要的登录天数和听歌次数,当前等级进度,对应 <https://music.163.com/#/user/level>

**接口地址 :** `/user/level`

**调用例子 :** `/user/level`
