---
title: '副歌时间'
description: '调用此接口, 传入歌曲id, 获取副歌时间'
---

# 副歌时间

> 调用此接口, 传入歌曲id, 获取副歌时间

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/song/chorus` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `song_chorus`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /song/chorus?id=2058263032
```

## 编程式调用

```ts
import { songChorus } from 'hana-music-api';

const result = await songChorus({
  id: '2058263032',
});

console.log(result.body);
```

## 返回内容

`chorus` 和 `data` 是同一组副歌记录，每条有 `id`、`startTime`、`endTime`（毫秒）和 `ugcLocked`。`code`、`chorus`、`chorus[].id`、`data`、`data[].id` 是收紧字段，其余字段宽松。

未知歌曲返回两个空数组（录制 `song_chorus.empty.json`），空数组是正常结果，不是错误。结构定义和类型是 `SongChorusBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口, 传入歌曲id, 获取副歌时间

**必选参数：**

`id`: 歌曲id

**接口地址:** `/song/chorus`

**调用例子:** `/song/chorus?id=2058263032`
