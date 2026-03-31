---
title: '更新用户信息'
description: '登录后调用此接口 , 传入相关信息,可以更新用户信息'
---

# 更新用户信息

> 登录后调用此接口 , 传入相关信息,可以更新用户信息

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/update` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_update`  |
| 文档分类 | 用户与登录     |

## 请求参数

| 参数        | 类型             | 必填 | 默认值 | 说明                           |
| ----------- | ---------------- | :--: | ------ | ------------------------------ |
| `gender`    | string           |  ✅  | -      | 性别 0:保密 1:男性 2:女性      |
| `birthday`  | number \| string |  ✅  | -      | 出生日期,时间戳 unix timestamp |
| `nickname`  | string           |  ✅  | -      | 用户昵称                       |
| `province`  | string           |  ✅  | -      | 省份id                         |
| `city`      | string           |  ✅  | -      | 城市id                         |
| `signature` | string           |  ✅  | -      | ：用户签名                     |

## HTTP 示例

```bash
GET /user/update?gender=0&signature=测试签名&city=440300&nickname=binary&birthday=1525918298004&province=440000
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_update({
  gender: '0',
  signature: '测试签名',
  city: '440300',
  nickname: 'binary',
  birthday: '1525918298004',
  province: '440000',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入相关信息,可以更新用户信息

**必选参数 :**

```
gender: 性别 0:保密 1:男性 2:女性

birthday: 出生日期,时间戳 unix timestamp

nickname: 用户昵称

province: 省份id

city: 城市id

signature：用户签名
```

**接口地址 :** `/user/update`

**调用例子 :** `/user/update?gender=0&signature=测试签名&city=440300&nickname=binary&birthday=1525918298004&province=440000`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
