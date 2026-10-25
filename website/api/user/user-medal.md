---
title: '用户徽章'
description: '调用此接口, 传入用户id, 获取用户徽章'
---

# 用户徽章

> 调用此接口, 传入用户id, 获取用户徽章

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/medal`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `user_medal`   |
| 文档分类 | 用户与登录     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/medal?uid=32953014
```

## 编程式调用

```ts
import { userMedal } from 'hana-music-api';

const result = await userMedal({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

徽章页在 `data`，`data.obtainMedals`、`data.categoryMedalBlockVos`、分类块的 `medalVOS` 和分组里的 `subGroups[].medals` 都是必填数组，收紧；`obtainMedals[].medalCode` 是记录自己的编号，也收紧，`medalVOS` 和 `subGroups[].medals` 里套着的徽章是嵌套记录，编号宽松。`subGroups` 可以没有（缺失或 `null` 正常），出现时里面的 `medals` 仍按记录校验，坏一条报 502；`subGroups` 里的 `hasMore`、`total`、`obtainedTotal`、`nextPage` 宽松。`medalTabs`、`musicMedalOperationVO`、`levelMedalPicUrl`、`userObtainProportion`、`detailPage`、`scene` 只见过 `null`，没有声明。不存在的 uid 返回 `code: 499`（`用户信息获取失败`），SDK 按业务拒绝原样转交。本批录制与探测未发现可达的空结果；数组本身允许为空（`user_medal.unknown-user.json` 是 code 499，不是空结果）。录制从 493 条已获得徽章截到 5 条、5 个分类块截到 3 个（见 `context.truncated`）；已获得徽章按字段覆盖抽样，保留原下标 0/1/18/259/289，分类块为 0/1/2；`sideBarGuideText` 的空串样例来自完整录制。结构定义和类型是 `UserMedalBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口, 传入用户id, 获取用户徽章

**必选参数 :**

`uid`: 用户 id

**接口地址 :** `/user/medal`

**调用例子 :** `/user/medal?uid=32953014`
