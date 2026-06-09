---
title: '获取 mv 数据'
description: '调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应'
---

# 获取 mv 数据

> 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/detail`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_detail`    |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明     |
| ------ | ------ | :--: | ------ | -------- |
| `mvid` | string |  ✅  | -      | mv 的 id |

## HTTP 示例

```bash
GET /mv/detail?mvid=5436712
```

## 编程式调用

```ts
import { mvDetail } from 'hana-music-api'

const result = await mvDetail({
  mvid: '5436712',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应
MV 数据 , 数据包含 mv 名字 , 歌手 , 发布时间 , mv 视频地址等数据 , 其中 mv 视频
网易做了防盗链处理 , 可能不能直接播放 , 需要播放的话需要调用 ' mv 地址' 接口

**必选参数 :** `mvid`: mv 的 id

**接口地址 :** `/mv/detail`

**调用例子 :** `/mv/detail?mvid=5436712`
