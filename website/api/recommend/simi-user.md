---
title: '获取最近 5 个听了这首歌的用户'
description: '调用此接口，传入歌曲 id, 最近 5 个听了这首歌的用户'
---

# 获取最近 5 个听了这首歌的用户

> 调用此接口，传入歌曲 id, 最近 5 个听了这首歌的用户

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/simi/user`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `simi_user`    |
| 文档分类 | 推荐与发现     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /simi/user?id=347230
```

## 编程式调用

```ts
import { simiUser } from 'hana-music-api';

const result = await simiUser({
  id: '347230',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧；相似用户列表 `body.userprofiles` 只有空数组证据、元素类型未知，没有声明，仍作为未声明字段原样保留。登录账号用 15 首歌曲（含 `108485`）探测都是空数组，只保留 `108485` 的录制（`simi_user.empty.json`），没有找到非空结果；缺少 `id` 时上游是 HTTP 400 空正文，SDK 归一成 `status: 200`、`body` 为空字符串原样返回，不报 502。本页录制来自登录账号（`context.viewer` 是 `authenticated`），没有保留匿名对照录制。

## 补充说明

说明 : 调用此接口，传入歌曲 id, 最近 5 个听了这首歌的用户

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/simi/user`

**调用例子 :** `/simi/user?id=347230` ( 对应 ' 光辉岁月 ' 相似歌曲 )
