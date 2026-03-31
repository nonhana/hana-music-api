---
title: "相关歌单"
description: "请替换为[相关歌单推荐](#相关歌单推荐)接口; 本接口通过html抓取内容, 现已无法抓取歌单"
---

# 相关歌单

> 请替换为[相关歌单推荐](#相关歌单推荐)接口; 本接口通过html抓取内容, 现已无法抓取歌单

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/related/playlist` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `related_playlist` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌单 id~~<br>~~**接口地址 :** `/related/playlist`~~<br>~~**调用例子 :** `/related/playlist?id=1`~~ |

## HTTP 示例

```bash
GET /related/playlist?id=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.related_playlist({
  id: "1",
})

console.log(result.body)
```

## 补充说明

说明: 请替换为[相关歌单推荐](/api/playlist/playlist-detail-rcmd-get)接口; 本接口通过html抓取内容, 现已无法抓取歌单

~~说明 : 调用此接口,传入歌单 id 可获取相关歌单(对应页面 [https://music.163.com/#/playlist?id=1](https://music.163.com/#/playlist?id=1))~~

~~**必选参数 :** `id` : 歌单 id~~

~~**接口地址 :** `/related/playlist`~~

~~**调用例子 :** `/related/playlist?id=1`~~

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
