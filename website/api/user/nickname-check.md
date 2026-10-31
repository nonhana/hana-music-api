---
title: '重复昵称检测'
description: '调用此接口 ,可检测昵称是否重复,并提供备用昵称'
---

# 重复昵称检测

> 调用此接口 ,可检测昵称是否重复,并提供备用昵称

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/nickname/check` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `nickname_check`  |
| 文档分类 | 用户与登录        |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明 |
| ---------- | ------ | :--: | ------ | ---- |
| `nickname` | string |  ✅  | -      | 昵称 |

## HTTP 示例

```bash
GET /nickname/check?nickname=binaryify
```

## 编程式调用

```ts
import { nicknameCheck } from 'hana-music-api';

const result = await nicknameCheck({
  nickname: 'binaryify',
});

console.log(result.body);
```

## 返回内容

昵称是否重复在 `duplicated`（`true` 表示已被占用）。昵称重复时上游还会给出 `candidateNicknames` 备用昵称。`code` 和 `duplicated` 收紧；`candidateNicknames` 按“可以没有”处理：昵称可用时整个缺失或为 `null` 都照常返回，出现时按字符串数组校验，坏一条报 502；`nickname` 是回显的查询昵称，宽松。结构定义和类型是 `NicknameCheckBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口 ,可检测昵称是否重复,并提供备用昵称
**必选参数 :**
`nickname` : 昵称

**接口地址 :** `/nickname/check`

**调用例子 :** `/nickname/check?nickname=binaryify`
