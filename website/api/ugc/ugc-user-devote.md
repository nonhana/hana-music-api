---
title: '用户贡献条目、积分、云贝数量'
description: '登录后调用此接口,使用此接口,可获取当前登录用户贡献条目、积分、云贝数量'
---

# 用户贡献条目、积分、云贝数量

> 登录后调用此接口,使用此接口,可获取当前登录用户贡献条目、积分、云贝数量

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/ugc/user/devote` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `ugc_user_devote`  |
| 文档分类 | 百科与用户贡献     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/user/devote
```

## 编程式调用

```ts
import { ugcUserDevote } from 'hana-music-api';

const result = await ugcUserDevote();

console.log(result.body);
```

## 返回内容

`body.code`、贡献计数的路径 `body.data` 和记录自己的编号 `body.data.userId` 收紧；`ugcCount`（贡献条目）、`integration`（积分）、`cloudShell`（云贝）是附带计数，全部宽松。登录和匿名的返回形状相同，匿名返回匿名账号的计数；两份录制里三个计数都是 0，非零计数没有证据。录制里的账号编号已换成合成值，`data.userId` 不是原始 uid，不对真实账号编号作断言。输入仍是 legacy。结构定义和类型是 `UgcUserDevoteBody`，见[返回体结构](/guide/response-bodies#百科与用户贡献)。

## 补充说明

说明: 登录后调用此接口,使用此接口,可获取当前登录用户贡献条目、积分、云贝数量

**接口地址:** `/ugc/user/devote`

**调用例子:** `/ugc/user/devote`
