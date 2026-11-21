---
title: '歌单详情动态'
description: '调用后可获取歌单详情动态部分，如评论数，是否收藏，播放数'
---

# 歌单详情动态

调用后可获取歌单详情动态部分，如评论数，是否收藏，播放数

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| 接口地址   | `/playlist/detail/dynamic`                                              |
| 请求方式   | `GET` / `POST`                                                          |
| 需要登录   | 否                                                                      |
| 对应模块   | `playlist_detail_dynamic`                                               |
| SDK 函数   | `playlistDetailDynamic`（`hana-music-api/api/playlist_detail_dynamic`） |
| 返回体类型 | `PlaylistDetailDynamicBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistDetailDynamic } from 'hana-music-api';

const result = await playlistDetailDynamic({
  id: '24381616',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/detail/dynamic' \
  --data-urlencode 'id=24381616'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                           |
| ---- | ------------------ | ---- | ------ | ------------------------------ |
| `id` | `number \| string` | 是   | -      | 歌单 id                        |
| `s`  | `number`           | 否   | `8`    | 返回的最近收藏者数量，默认 `8` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistDetailDynamicBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_detail_dynamic`、`hana-music-api/schemas/playlist_detail_dynamic` 导入运行时校验器）。

```ts
type PlaylistDetailDynamicBody = {
  code: 200;
  bookedCount?: number | null;
  commentCount?: number | null;
  followed?: boolean | null;
  gradeStatus?: string | null;
  playCount?: number | null;
  shareCount?: number | null;
  subscribed?: boolean | null;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `bookedCount`  | `number`  | 否   | -                            |
| `commentCount` | `number`  | 否   | 评论数                       |
| `followed`     | `boolean` | 否   | 是否已关注                   |
| `gradeStatus`  | `string`  | 否   | -                            |
| `playCount`    | `number`  | 否   | 播放次数                     |
| `shareCount`   | `number`  | 否   | 分享数                       |
| `subscribed`   | `boolean` | 否   | 是否已收藏                   |

<!-- api-doc:response:end -->
