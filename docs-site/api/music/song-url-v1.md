---
title: '获取音乐 url - 新版'
description: '使用注意事项同上'
---

# 获取音乐 url - 新版

> 使用注意事项同上

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/song/url/v1` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `song_url_v1`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明                                                                                                                              |
| ---------- | ------ | :--: | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | string |  ✅  | -      | 音乐 id                                                                                                                           |
| `level`    | string |  ✅  | -      | 播放音质等级, 分为 `standard` => `标准`,`higher` => `较高`, `exhigh`=>`极高`,                                                     |
| `lossless` | string |  ✅  | -      | =>`无损`, `hires`=>`Hi-Res`, `jyeffect` => `高清环绕声`, `sky` => `沉浸环绕声`, `dolby` => `杜比全景声`, `jymaster` => `超清母带` |

## HTTP 示例

```bash
GET /song/url/v1?id=33894312&level=exhigh
GET /song/url/v1?id=405998841,33894312&level=lossless
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_url_v1({
  id: '33894312',
  level: 'exhigh',
})

console.log(result.body)
```

## 补充说明

说明 : 使用注意事项同上

**必选参数 :** `id` : 音乐 id
`level`: 播放音质等级, 分为 `standard` => `标准`,`higher` => `较高`, `exhigh`=>`极高`,
`lossless`=>`无损`, `hires`=>`Hi-Res`, `jyeffect` => `高清环绕声`, `sky` => `沉浸环绕声`, `dolby` => `杜比全景声`, `jymaster` => `超清母带`

**接口地址 :** `/song/url/v1`

**调用例子 :** `/song/url/v1?id=33894312&level=exhigh` `/song/url/v1?id=405998841,33894312&level=lossless`

说明：`杜比全景声`音质需要设备支持，不同的设备可能会返回不同码率的url。cookie需要传入`os=pc`保证返回正常码率的url。

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
