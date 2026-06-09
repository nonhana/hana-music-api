---
title: '音乐日历'
description: '登录后调用此接口,传入开始和结束时间,可获取音乐日历'
---

# 音乐日历

> 登录后调用此接口,传入开始和结束时间,可获取音乐日历

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/calendar`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `calendar`     |
| 文档分类 | 推荐与发现     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /calendar?startTime=1606752000000&endTime=1609430399999
```

## 编程式调用

```ts
import { calendar } from 'hana-music-api'

const result = await calendar({
  startTime: '1606752000000',
  endTime: '1609430399999',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,传入开始和结束时间,可获取音乐日历

**接口地址 :** `/calendar`

**调用例子 :** `/calendar?startTime=1606752000000&endTime=1609430399999`
