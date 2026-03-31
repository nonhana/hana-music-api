---
title: "获取用户动态"
description: "登录后调用此接口 , 传入用户 id, 可以获取用户动态"
---

# 获取用户动态

> 登录后调用此接口 , 传入用户 id, 可以获取用户动态

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/user/event` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `user_event` |
| 文档分类 | 社交与消息 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `uid` | string | ✅ | - | 用户 id |
| `limit` | number \| string | — | 30 | 返回数量 , 默认为 30 |
| `lasttime` | string | — | -1,传入上一次返回结果的 | 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /user/event?uid=32953014
GET /user/event?uid=32953014&limit=1&lasttime=1558011138743
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_event({
  uid: "32953014",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户动态

**必选参数 :** `uid` : 用户 id

**可选参数 :** `limit` : 返回数量 , 默认为 30

`lasttime` : 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据

**接口地址 :** `/user/event`

**调用例子 :** `/user/event?uid=32953014` `/user/event?uid=32953014&limit=1&lasttime=1558011138743`

返回结果的`type`参数对应:

```
18 分享单曲
19 分享专辑
17、28 分享电台节目
22 转发
39 发布视频
35、13 分享歌单
24 分享专栏文章
41、21 分享视频
```

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
