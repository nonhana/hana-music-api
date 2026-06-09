---
title: '听歌打卡'
description: '调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据'
---

# 听歌打卡

> 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/scrobble`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `scrobble`     |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数   | 类型             | 必填 | 默认值 | 说明                               |
| ------ | ---------------- | :--: | ------ | ---------------------------------- |
| `id`   | string           |  ✅  | -      | 歌曲 id, `sourceid`: 歌单或专辑 id |
| `time` | number \| string |  —   | -      | 歌曲播放时间,单位为秒              |

## HTTP 示例

```bash
GET /scrobble?id=518066366&sourceid=36780169&time=291
```

## 编程式调用

```ts
import { scrobble } from 'hana-music-api'

const result = await scrobble({
  id: '518066366',
  sourceid: '36780169',
  time: '291',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据

**必选参数 :** `id`: 歌曲 id, `sourceid`: 歌单或专辑 id

**可选参数 :** `time`: 歌曲播放时间,单位为秒

**接口地址 :** `/scrobble`

**调用例子 :** `/scrobble?id=518066366&sourceid=36780169&time=291`
