---
title: '音乐是否可用'
description: "调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`"
---

# 音乐是否可用

> 调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/check/music` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `check_music`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数 | 类型             | 必填 | 默认值 | 说明                                                                                                     |
| ---- | ---------------- | :--: | ------ | -------------------------------------------------------------------------------------------------------- |
| `id` | number \| string |  ✅  | 999000 | 歌曲 id<br>**可选参数** : `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推 |

## HTTP 示例

```bash
GET /check/music?id=33894312
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.check_music({
  id: '33894312',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`

**必选参数 :** `id` : 歌曲 id

**可选参数** : `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推

**接口地址 :** `/check/music`

**调用例子 :** `/check/music?id=33894312`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
