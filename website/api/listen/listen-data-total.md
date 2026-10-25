---
title: '听歌足迹 - 总收听时长'
description: '登录后调用此接口, 获取总收听时长; 相关接口可能需要vip权限'
---

# 听歌足迹 - 总收听时长

> 登录后调用此接口, 获取总收听时长; 相关接口可能需要vip权限

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/listen/data/total` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `listen_data_total`  |
| 文档分类 | 听歌记录             |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /listen/data/total
```

## 编程式调用

```ts
import { listenDataTotal } from 'hana-music-api';

const result = await listenDataTotal();

console.log(result.body);
```

## 返回内容

`body.code` 和 `body.data.totalDuration` 收紧（总收听时长就是接口要返回的那一项）；`message` 宽松。本页录制来自登录账号（`context.viewer` 是 `authenticated`）；未登录时上游返回 `code: 302`（`listen_data_total.anonymous.json`），SDK 以 `status: 302` 转交原文。本批没有零数据账号，空账号下 `data` 的实际表现未验证。

## 补充说明

说明 : 登录后调用此接口, 获取总收听时长; 相关接口可能需要vip权限

**接口地址 :** `/listen/data/total`
