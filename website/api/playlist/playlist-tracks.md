---
title: '对歌单添加或删除歌曲'
description: '调用此接口，可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )'
---

# 对歌单添加或删除歌曲

> 调用此接口，可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/tracks` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `playlist_tracks`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数     | 类型                      | 必填 | 默认值   | 说明                                              |
| -------- | ------------------------- | :--: | -------- | ------------------------------------------------- |
| `op`     | string                    |  ✅  | -        | 从歌单增加单曲为 add, 删除为 del                  |
| `pid`    | `number \| string`        |  ✅  | -        | 歌单 id                                           |
| `tracks` | `(number \| string)` 数组 |  ✅  | -        | 歌曲 id 数组                                      |
| `step`   | `'initial' \| 'fallback'` |      | 自动模式 | initial 只执行首次请求；fallback 直接执行一次后备 |

## HTTP 示例

```http
POST /playlist/tracks
Content-Type: application/json

{"op":"add","pid":24381616,"tracks":[347231],"step":"initial"}
```

## 编程式调用

```ts
import { playlistTracks } from 'hana-music-api';

const result = await playlistTracks({
  op: 'add',
  pid: 24381616,
  tracks: [347231],
});

console.log(result.body);
```

## 分步后备

省略 `step` 时，只有首次请求的业务码为 512 才会自动发送一次后备请求。传 `initial` 时，512 直接按失败返回；应用可以确认后再传 `fallback`，用原始曲目数组直接执行后备，SDK 负责追加编号和编码。后备无论成功或失败都至多发送一次。

SDK 的两次调用可以分别配置 Cookie、设备、token、取消和期限，应用负责选择当次值。固定 token 在同一模块调用只允许一次 API 请求，自动模式应使用逐次取新值的异步 provider。HTTP 不开放通用 `checkToken` 配置；浏览器与服务端分处两端时，由应用自己的服务端转交到 SDK。完整示例见[按需后备](/guide/programmatic-api#歌单曲目在-512-后再取-token)。

分步调用不保存上一步状态，不提供跨调用事务、回滚或幂等保证。测试时请把 `pid` 换成自己的歌单编号。
