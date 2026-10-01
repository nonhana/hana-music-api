---
title: '搜索'
description: '按关键词搜索歌曲、专辑、歌手、歌单等内容。'
---

# 搜索

按关键词搜索歌曲、专辑、歌手、歌单等内容。关键词可以用空格分隔，比如“周杰伦 搁浅”。

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/search`          |
| 请求方式 | GET / POST         |
| 需要登录 | 否，可使用游客身份 |
| 对应模块 | `search`           |

## 请求参数

| 参数       | 类型                | 必填 | 默认值 | 说明                                        |
| ---------- | ------------------- | ---- | ------ | ------------------------------------------- |
| `keywords` | string              | 是   | 无     | 搜索关键词                                  |
| `type`     | number 或数字字符串 | 否   | `1`    | 搜索类型，见下表                            |
| `limit`    | number 或数字字符串 | 否   | `30`   | 返回数量                                    |
| `offset`   | number 或数字字符串 | 否   | `0`    | 跳过的结果数量，一般为 `(页码 - 1) * limit` |

| `type` | 搜索内容                                     |
| ------ | -------------------------------------------- |
| `1`    | 单曲                                         |
| `10`   | 专辑                                         |
| `100`  | 歌手                                         |
| `1000` | 歌单                                         |
| `1002` | 用户                                         |
| `1004` | MV                                           |
| `1006` | 歌词                                         |
| `1009` | 电台                                         |
| `1014` | 视频                                         |
| `1018` | 综合                                         |
| `2000` | 声音，使用独立的上游搜索接口，响应结构也不同 |

## HTTP 示例

```bash
curl --get 'http://127.0.0.1:3021/search' \
  --data-urlencode 'keywords=海阔天空' \
  --data-urlencode 'limit=5' \
  --data-urlencode 'offset=0'
```

## 编程式调用

```ts
import { search } from 'hana-music-api';

const result = await search({ keywords: '海阔天空', limit: 5, offset: 0 });
console.log(result.body);
```

本接口属于明确读接口，可使用 [缓存与同时请求合并](/guide/sdk-cache-and-identity-pool)。未声明字段会在输入解码时移除，添加 `timestamp` 不能强制刷新本地缓存。

也可以使用 [云搜索](/api/search/cloudsearch)。拿到歌曲 ID 后，通过 [歌曲播放地址](/api/music/song-url) 获取播放链接。
