---
title: 'vip 成长值'
description: '登录后调用此接口，可获取当前会员成长值'
---

# vip 成长值

> 登录后调用此接口，可获取当前会员成长值

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/vip/growthpoint` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `vip_growthpoint`  |
| 文档分类 | 会员与云贝         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /vip/growthpoint
```

## 编程式调用

```ts
import { vipGrowthpoint } from 'hana-music-api';

const result = await vipGrowthpoint();

console.log(result.body);
```

## 返回内容

`body.code`、成长值页 `body.data`、当前用户记录 `body.data.userLevel` 及其 `userId`、`growthPoint` 收紧；`levelCard` 是附带展示信息，字段全部宽松。登录对照的字段集合与类型相同，值差异只来自账号状态；匿名对照录制保留为 `vip/vip_growthpoint.anonymous.json`。结构定义和类型是 `VipGrowthpointBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获取当前会员成长值

**接口地址 :** `/vip/growthpoint`

**调用例子 :** `/vip/growthpoint`
