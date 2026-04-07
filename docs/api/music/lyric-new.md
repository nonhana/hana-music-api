---
title: '获取逐字歌词'
description: '此接口的 `yrc` 字段即为逐字歌词 (可能有歌曲不包含逐字歌词)'
---

# 获取逐字歌词

> 此接口的 `yrc` 字段即为逐字歌词 (可能有歌曲不包含逐字歌词)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/lyric/new`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `lyric_new`    |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 音乐 id |

## HTTP 示例

```bash
GET /lyric/new?id=1824020871
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.lyric_new({
  id: '1824020871',
})

console.log(result.body)
```

## 补充说明

说明 : 此接口的 `yrc` 字段即为逐字歌词 (可能有歌曲不包含逐字歌词)

**必选参数 :** `id`: 音乐 id

**接口地址 :** `/lyric/new`

**调用例子 :** `/lyric/new?id=1824020871`

相关讨论可见: [Issue](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1667)

**歌词格式解析 :**

当逐字歌词适用时，`yrc`的`lyric`字段包括形式如下的内容

- （可能存在）JSON 歌曲元数据

```
{"t":0,"c":[{"tx":"作曲: "},{"tx":"柳重言","li":"http://p1.music.126.net/Icj0IcaOjH2ZZpyAM-QGoQ==/6665239487822533.jpg","or":"orpheus://nm/artist/home?id=228547&type=artist"}]}
{"t":5403,"c":[{"tx":"编曲: "},{"tx":"Alex San","li":"http://p1.music.126.net/pSbvYkrzZ1RFKqoh-fA9AQ==/109951166352922615.jpg","or":"orpheus://nm/artist/home?id=28984845&type=artist"}]}
{"t":10806,"c":[{"tx":"制作人: "},{"tx":"王菲","li":"http://p1.music.126.net/1KQVD6XWbs5IAV0xOj1ZIA==/18764265441342019.jpg","or":"orpheus://nm/artist/home?id=9621&type=artist"},{"tx":"/"},{"tx":"梁荣骏","li":"http://p1.music.126.net/QrD8drwrRcegfKLPoiiG2Q==/109951166288436155.jpg","or":"orpheus://nm/artist/home?id=189294&type=artist"}]}
```

该字段不一定出现；可能出现的数据意义有：

- `t` : 数据显示开始时间戳 (毫秒)
- `c` : 元数据list
- `tx`: 文字段
- `li`: 艺术家、歌手头像图url
- `or`：云音乐app内路径；例中作用即打开艺术家主页

* 逐字歌词

```
[16210,3460](16210,670,0)还(16880,410,0)没...
 ~~~~1 ~~~2  ~~~~3 ~~4 5 ~6 (...)
```

由标号解释:

1. 歌词行显示开始时间戳 (毫秒)
2. 歌词行显示总时长(毫秒)
3. 逐字显示开始时间戳 (毫秒)
4. 逐字显示时长 (厘秒/0.01s)
5. 未知
6. 文字

`yrc`的`version`字段貌似与`lyric`字段格式无关

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
