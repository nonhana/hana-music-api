---
title: '歌单封面上传'
description: "登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新歌单封面。本地 Demo 页已切换到 `/demo/upload/playlist-cover`。"
---

# 歌单封面上传

> 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新歌单封面。本地 Demo 页已切换到 `/demo/upload/playlist-cover`。

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
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_cover_update({
  id: '3143833470',
  imgSize: '200',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新歌单封面。本地 Demo 页已切换到 `/demo/upload/playlist-cover`

**必选参数 :**  
`id`: 歌单 id 3143833470

**可选参数 :**

`imgSize` : 图片尺寸,默认为 300

`imgX` : 水平裁剪偏移,方形图片可不传,默认为 0
`imgY` : 垂直裁剪偏移,方形图片可不传,默认为 0

**接口地址 :** `/playlist/cover/update`

**调用例子 :** `/playlist/cover/update?id=3143833470&imgSize=200`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
