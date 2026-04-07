---
title: '对歌单添加或删除歌曲'
description: '调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )'
---

# 对歌单添加或删除歌曲

> 调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/tracks` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `playlist_tracks`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                             |
| -------- | ------------------ | :--: | ------ | -------------------------------- |
| `op`     | string             |  ✅  | -      | 从歌单增加单曲为 add, 删除为 del |
| `pid`    | string             |  ✅  | -      | 歌单 id                          |
| `tracks` | string[] \| string |  ✅  | -      | 歌曲 id,可多个,用逗号隔开        |

## HTTP 示例

```bash
GET /playlist/tracks?op=add&pid=24381616&tracks=347231
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_tracks({
  op: 'add',
  pid: '24381616',
  tracks: '347231',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )

**必选参数 :**

`op`: 从歌单增加单曲为 add, 删除为 del

`pid`: 歌单 id
`tracks`: 歌曲 id,可多个,用逗号隔开

**接口地址 :** `/playlist/tracks`

**调用例子 :** `/playlist/tracks?op=add&pid=24381616&tracks=347231` ( 对应把歌曲添加到 ' 我 ' 的歌单 , 测试的时候请把这里的 pid 换成你自己的, id 和 tracks 不对可能会报 502 错误)

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
