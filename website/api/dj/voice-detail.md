---
title: '播客声音详情'
description: '获取播客里的声音详情'
---

# 播客声音详情

> 获取播客里的声音详情

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/voice/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `voice_detail`  |
| 文档分类 | 电台与播客      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voice/detail
```

## 编程式调用

```ts
import { voiceDetail } from 'hana-music-api';

const result = await voiceDetail();

console.log(result.body);
```

## 返回内容

工作台接口只允许读取自己的声音。当前账号没有声音，访问他人声音返回 `code: 401`（`不允许操作他人的声音`）；未知 id 返回 HTTP 200、正文 `code: 200`、`data: null` 的空成功。没有录到带字段的成功正文，SDK 暂不为该模块声明结构定义，`body` 原样返回网易云正文。

## 补充说明

说明: 获取播客里的声音详情

**接口地址:** `/voice/detail`

**必选参数：**
`id`: 播客声音id(voiceId)

返回结果的`displayStatus`参数对应:

```text
同上
```
