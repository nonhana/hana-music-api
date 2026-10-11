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
import { songUrlV1 } from 'hana-music-api';

const result = await songUrlV1({
  id: '33894312',
  level: 'exhigh',
});

console.log(result.body);
```

## 返回内容

`body.data` 里每项是一首歌的播放地址，声明了 `id`、`url`、`code`、`level`（实际给到的音质，可能比请求的低）、`expi`（地址有效的秒数，实测是 1200）和 `freeTrialInfo`：

- 无版权：`url` 和 `level` 是 `null`，`code` 不是 200（实测是 404）。
- 只能试听：`freeTrialInfo` 是 `{ start, end }`，即试听片段在整首里的起止秒数，`url` 是这段片段的地址；能听完整首时是 `null`。

结构定义和类型是 `SongUrlV1Body`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 使用注意事项同上

**必选参数 :** `id` : 音乐 id
`level`: 播放音质等级, 分为 `standard` => `标准`,`higher` => `较高`, `exhigh`=>`极高`,
`lossless`=>`无损`, `hires`=>`Hi-Res`, `jyeffect` => `高清环绕声`, `sky` => `沉浸环绕声`, `dolby` => `杜比全景声`, `jymaster` => `超清母带`

**接口地址 :** `/song/url/v1`

**调用例子 :** `/song/url/v1?id=33894312&level=exhigh` `/song/url/v1?id=405998841,33894312&level=lossless`

说明：`杜比全景声`音质需要设备支持，不同的设备可能会返回不同码率的url。cookie需要传入`os=pc`保证返回正常码率的url。
