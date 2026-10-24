---
title: '听歌打卡'
description: '调用此接口，传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据'
---

# 听歌打卡

> 调用此接口，传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/scrobble`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `scrobble`     |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数       | 类型             | 必填 | 默认值 | 说明                                  |
| ---------- | ---------------- | :--: | ------ | ------------------------------------- |
| `id`       | string           |  ✅  | -      | 歌曲 id                               |
| `sourceid` | string \| number |  ✅  | -      | 播放来源 id；没有容器 id 的来源传 `0` |
| `source`   | string           |  —   | `list` | 播放来源类型                          |
| `time`     | number \| string |  —   | -      | 歌曲播放时间，单位为整数秒            |

## HTTP 示例

```bash
GET /scrobble?id=518066366&sourceid=36780169&source=list&time=291
```

## 编程式调用

```ts
import { scrobble } from 'hana-music-api';

const result = await scrobble({
  id: '518066366',
  sourceid: '36780169',
  source: 'list',
  time: '291',
});

console.log(result.body);
```

## 返回内容

声明了 `code`、`data`、`message`，只有 `code` 收紧。调用会向 `clientlog.music.163.com` 发送 `startplay` 和 `play` 两条 eapi 上报；返回 200 仍不等于网易云已经计入排行。结构定义和类型是 `ScrobbleBody`，见 [返回体结构](/guide/response-bodies)。

## 播放来源

`source` 会原样写入 `play` 上报，常用值和 `sourceid` 约定如下：

| `source`    | `sourceid`               |
| ----------- | ------------------------ |
| `list`      | 歌单 id                  |
| `album`     | 专辑 id                  |
| `artist`    | 歌手 id                  |
| `recommend` | 没有稳定来源 id 时传 `0` |
| `search`    | 没有稳定来源 id 时传 `0` |
| `download`  | 没有稳定来源 id 时传 `0` |

计入听歌排行需要有效登录 Cookie。打卡结果有延迟，真实账号验证应只做 1–2 次，并记录打卡前后的排行数值。

## 补充说明

说明 : 调用此接口，传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据

**必选参数 :** `id`: 歌曲 id, `sourceid`: 播放来源 id

**可选参数 :** `source`: 播放来源类型（默认 `list`）, `time`: 歌曲播放时间,单位为整数秒

**接口地址 :** `/scrobble`

**调用例子 :** `/scrobble?id=518066366&sourceid=36780169&source=list&time=291`
