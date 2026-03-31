---
title: '获取歌曲详情'
description: '调用此接口 , 传入音乐 id(支持多个 id, 用 `,` 隔开), 可获得歌曲详情(dt为歌曲时长)'
---

# 获取歌曲详情

> 调用此接口 , 传入音乐 id(支持多个 id, 用 `,` 隔开), 可获得歌曲详情(dt为歌曲时长)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/song/detail` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `song_detail`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明                     |
| ----- | ------ | :--: | ------ | ------------------------ |
| `ids` | string |  ✅  | -      | 音乐 id, 如 `ids=347230` |

## HTTP 示例

```bash
GET /song/detail?ids=347230
GET /song/detail?ids=347230,347231
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_detail({
  ids: '347230',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 `,` 隔开), 可获得歌曲详情(dt为歌曲时长)

**必选参数 :** `ids`: 音乐 id, 如 `ids=347230`

**接口地址 :** `/song/detail`

**调用例子 :** `/song/detail?ids=347230`,`/song/detail?ids=347230,347231`

返回字段说明(感谢 [@tuxzz](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1121#issuecomment-774438040) 整理):

```
name: String, 歌曲标题
id: u64, 歌曲ID
pst: 0，功能未知
t: enum,
  0: 一般类型
  1: 通过云盘上传的音乐，网易云不存在公开对应
    如果没有权限将不可用，除了歌曲长度以外大部分信息都为null。
    可以通过 `/api/v1/playlist/manipulate/tracks` 接口添加到播放列表。
    如果添加到“我喜欢的音乐”，则仅自己可见，除了长度以外各种信息均为未知，且无法播放。
    如果添加到一般播放列表，虽然返回code 200，但是并没有效果。
    网页端打开会看到404画面。
    属于这种歌曲的例子: https://music.163.com/song/1345937107
  2: 通过云盘上传的音乐，网易云存在公开对应
    如果没有权限则只能看到信息，但无法直接获取到文件。
    可以通过 `/api/v1/playlist/manipulate/tracks` 接口添加到播放列表。
    如果添加到“我喜欢的音乐”，则仅自己可见，且无法播放。
    如果添加到一般播放列表，则自己会看到显示“云盘文件”，且云盘会多出其对应的网易云公开歌曲。其他人看到的是其对应的网易云公开歌曲。
    网页端打开会看到404画面。
    属于这种歌曲的例子: https://music.163.com/song/435005015
ar: Vec<Artist>, 歌手列表
alia: Vec<String>,
  别名列表，第一个别名会被显示作副标题
  例子: https://music.163.com/song/536623501
pop: 小数，常取[0.0, 100.0]中离散的几个数值, 表示歌曲热度
st: 0: 功能未知
rt: Option<String>, None、空白字串、或者类似`600902000007902089`的字符串，功能未知
fee: enum,
  0: 免费或无版权
  1: VIP 歌曲
  4: 购买专辑
  8: 非会员可免费播放低音质，会员可播放高音质及下载
  fee 为 1 或 8 的歌曲均可单独购买 2 元单曲
v: u64, 常为[1, ?]任意数字, 代表歌曲当前信息版本
version: u64, 常为[1, ?]任意数字, 代表歌曲当前信息版本
crbt: Option<String>, None或字符串表示的十六进制，功能未知
cf: Option<String>, 空白字串或者None，功能未知
al: Album, 专辑，如果是DJ节目(dj_type != 0)或者无专辑信息(single == 1)，则专辑id为0
dt: u64, 歌曲时长
hr: Option<Quality>, Hi-Res质量文件信息
sq: Option<Quality>, 无损质量文件信息
h: Option<Quality>, 高质量文件信息
m: Option<Quality>, 中质量文件信息
l: Option<Quality>, 低质量文件信息
a: Option<未知>, 常为None, 功能未知
cd: Option<String>, None或如"04", "1/2", "3", "null"的字符串，表示歌曲属于专辑中第几张CD，对应音频文件的Tag
no: u32, 表示歌曲属于CD中第几曲，0表示没有这个字段，对应音频文件的Tag
rtUrl: Option<String(?)>, 常为None, 功能未知
rtUrls: Vec<String(?)>, 常为空列表, 功能未知
djId: u64,
  0: 不是DJ节目
  其他：是DJ节目，表示DJ ID
copyright: u32, 0, 1, 2: 功能未知
s_id: u64, 对于t == 2的歌曲，表示匹配到的公开版本歌曲ID
mark: u64, 一些歌曲属性，用按位与操作获取对应位置的值
  8192 立体声?(不是很确定)
  131072 纯音乐
  262144 支持 杜比全景声(Dolby Atmos)
  1048576 脏标 🅴
  17179869184 支持 Hi-Res
  其他未知，理论上有从1到2^63共64种不同的信息
  专辑信息的mark字段也同理
  例子:id 1859245776 和 1859306637 为同一首歌，前者 mark & 1048576 == 1048576,后者 mark & 1048576 == 0，因此前者是脏版。

originCoverType: enum
  0: 未知
  1: 原曲
  2: 翻唱
originSongSimpleData: Option<SongSimpleData>, 对于翻唱曲，可选提供原曲简单格式的信息
single: enum,
  0: 有专辑信息或者是DJ节目
  1: 未知专辑
noCopyrightRcmd: Option<NoCopyrightRcmd>, 不能判断出歌曲有无版权
mv: u64, 非零表示有MV ID
rtype: 常为0，功能未知
rurl: Option<String(?)>, 常为None，功能未知
mst: u32, 偶尔为0, 常为9，功能未知
cp: u64, 功能未知
publishTime: i64, 毫秒为单位的Unix时间戳
pc: 云盘歌曲信息，如果不存在该字段，则为非云盘歌曲
privilege:权限相关信息
  cs:bool,是否为云盘歌曲
  st:小于0时为灰色歌曲, 使用上传云盘的方法解灰后 st == 0
  toast:bool,是否「由于版权保护，您所在的地区暂时无法使用。」
  flLevel:免费用户的该歌曲播放音质
  plLevel:当前用户的该歌曲最高试听音质
  dlLevel:当前用户的该歌曲最高下载音质
  maxBrLevel；歌曲最高音质
```

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
