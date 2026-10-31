---
title: '获取歌词'
description: '调用此接口，传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )'
---

# 获取歌词

> 调用此接口，传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/lyric`       |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `lyric`        |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 音乐 id |

## HTTP 示例

```bash
GET /lyric?id=33894312
```

## 编程式调用

```ts
import { lyric } from 'hana-music-api';

const result = await lyric({
  id: '33894312',
});

console.log(result.body);
```

## 返回内容

`lrc` 是逐行歌词，一直都在；没收录时 `lyric` 是“暂无歌词”，纯音乐也会带一行说明。`code`、`lrc`、`lrc.lyric` 是收紧字段。

`tlyric`、`romalrc`、`klyric` 是翻译、音译和 K 歌词，可能整个缺失，也可能在、但 `lyric` 是空串；`lyricUser`、`transUser` 是作词和翻译贡献者，字段与 `lyric_new` 相同。它们和 `pureMusic`、`needDesc`、`uncollected`、`sgc`、`sfy`、`qfy` 一样是宽松字段。`briefDesc` 在录制里只见过 `null`，没有声明。结构定义和类型是 `LyricBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )

**必选参数 :** `id`: 音乐 id

**接口地址 :** `/lyric`

**调用例子 :** `/lyric?id=33894312`
