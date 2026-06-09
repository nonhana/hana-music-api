---
title: '歌单封面上传'
description: "登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新歌单封面(参考:https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/playlist_cover_update.html)"
---

# 歌单封面上传

> 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新歌单封面(参考:https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/playlist_cover_update.html)

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/playlist/cover/update` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 是                       |
| 对应模块 | `playlist_cover_update`  |
| 文档分类 | 歌单                     |

## 请求参数

| 参数      | 类型             | 必填 | 默认值 | 说明                                 |
| --------- | ---------------- | :--: | ------ | ------------------------------------ |
| `id`      | string           |  ✅  | -      | 歌单 id 3143833470                   |
| `imgSize` | number \| string |  —   | 300    | 图片尺寸,默认为 300                  |
| `imgX`    | number \| string |  —   | 0      | 水平裁剪偏移,方形图片可不传,默认为 0 |
| `imgY`    | number \| string |  —   | 0      | 垂直裁剪偏移,方形图片可不传,默认为 0 |

## HTTP 示例

```bash
GET /playlist/cover/update?id=3143833470&imgSize=200
```

## 编程式调用

```ts
import { playlistCoverUpdate } from 'hana-music-api'

const result = await playlistCoverUpdate({
  id: '3143833470',
  imgSize: '200',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新歌单封面(参考:https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/playlist_cover_update.html)

**必选参数 :**  
`id`: 歌单 id 3143833470

**可选参数 :**

`imgSize` : 图片尺寸,默认为 300

`imgX` : 水平裁剪偏移,方形图片可不传,默认为 0
`imgY` : 垂直裁剪偏移,方形图片可不传,默认为 0

**接口地址 :** `/playlist/cover/update`

**调用例子 :** `/playlist/cover/update?id=3143833470&imgSize=200`
