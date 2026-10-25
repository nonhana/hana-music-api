---
title: '音乐是否可用'
description: "调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`"
---

# 音乐是否可用

> 调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/check/music` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `check_music`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数 | 类型             | 必填 | 默认值 | 说明                                                                                                     |
| ---- | ---------------- | :--: | ------ | -------------------------------------------------------------------------------------------------------- |
| `id` | number \| string |  ✅  | 999000 | 歌曲 id<br>**可选参数** : `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推 |

## HTTP 示例

```bash
GET /check/music?id=33894312
```

## 编程式调用

```ts
import { checkMusic } from 'hana-music-api';

const result = await checkMusic({
  id: '33894312',
});

console.log(result.body);
```

## 返回内容

`body` 是 SDK 合成的最终体 `{ code, success, message }`，不是网易云原文：模块只读取上游顶层 `code` 和 `data[0].code`，上游 `data` 数组不会保留。这三个字段都收紧。旧实现已经会拒绝：正文不是对象（旧路径 `body.code`）、`data` 存在但不是数组或是 `null`（`body.data`）、`data[0]` 不是对象、`data[0].code` 缺失或不是数字。相对基线新增的是 `data` 缺失（旧实现返回 `success: false`）；`data[0]` 不是对象现在报 `body.data[0]`，`data[0]` 缺 `code` 的 `actual` 是 `missing`。`data[1..]` 不校验，空数组按不可播放处理。

- 可播放：上游返回码是 200 且条目 `code` 是 200，返回 `{ code: 200, success: true, message: 'ok' }`。
- 无版权、歌曲不存在或条目 `code` 不是 200：返回 `{ code: 200, success: false, message: '亲爱的,暂无版权' }`。
- 上游顶层返回码不是 200：按业务拒绝原样转交，`status` 取上游返回码，不再合成 `success: false`。

`check_music` 匿名可用；匿名和登录录制结构相同，但本次快照里匿名录制的条目 `code` 是 404、登录录制是 200（与 `song_url` 的上游码翻转一致），不对两种视角的可播放结果作相同性断言。录制保存的是上游原文，最终体写在 `context.expect`。结构定义和类型是 `CheckMusicBody`，见 [返回体结构](/guide/response-bodies#播放)。

## 补充说明

说明: 调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`

**必选参数 :** `id` : 歌曲 id

**可选参数** : `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推

**接口地址 :** `/check/music`

**调用例子 :** `/check/music?id=33894312`
