---
title: '用户状态 - 编辑'
description: '登录后调用此接口, 编辑当前用户状态， 所需参数可在接口`/user/social/status/support`获取'
---

# 用户状态 - 编辑

> 登录后调用此接口, 编辑当前用户状态， 所需参数可在接口`/user/social/status/support`获取

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/user/social/status/edit` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `user_social_status_edit`  |
| 文档分类 | 用户与登录                 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/social/status/edit
```

## 编程式调用

```ts
import { userSocialStatusEdit } from 'hana-music-api';

const result = await userSocialStatusEdit();

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`；`data` 是设置成功后的展示提示（录制里是字符串「将展示7天」），`message` 是附带提示，都宽松。该接口只能设置状态：四个字段全空的调用被上游以 `code: 500` 拒绝（录制 `user_social_status_edit.clear-rejected.json`），模块内没有清空调用；录制结束后用模块外 `content` 为空的原始请求清空，再用 `user_social_status` 回读确认 `data` 为空对象。结构定义和类型是 `UserSocialStatusEditBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口, 编辑当前用户状态， 所需参数可在接口`/user/social/status/support`获取

**接口地址 :** `/user/social/status/edit`
