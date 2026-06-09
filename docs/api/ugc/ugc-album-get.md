---
title: '专辑简要百科信息'
description: '登录后调用此接口,使用此接口,传入专辑id,可获取对应的专辑简要百科信息'
---

# 专辑简要百科信息

> 登录后调用此接口,使用此接口,传入专辑id,可获取对应的专辑简要百科信息

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/ugc/album/get` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `ugc_album_get`  |
| 文档分类 | 百科与用户贡献   |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/album/get?id=168223858
```

## 编程式调用

```ts
import { ugcAlbumGet } from 'hana-music-api'

const result = await ugcAlbumGet({
  id: '168223858',
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,传入专辑id,可获取对应的专辑简要百科信息

**必选参数：**

`id`: 专辑id

**接口地址:** `/ugc/album/get`

**调用例子:** `/ugc/album/get?id=168223858`
