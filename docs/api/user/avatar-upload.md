---
title: '更新头像'
description: "登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片 formData(name 为'imgFile'),可更新头像。参考: https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/avatar_update.html"
---

# 更新头像

> 登录后调用此接口，使用 `'Content-Type': 'multipart/form-data'` 上传图片 formData
> （name 为 `imgFile`）即可更新头像。
> 参考：<https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/avatar_update.html>

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/avatar/upload` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `avatar_upload`  |
| 文档分类 | 用户与登录       |

## 请求参数

| 参数      | 类型             | 必填 | 默认值 | 说明                                 |
| --------- | ---------------- | :--: | ------ | ------------------------------------ |
| `imgSize` | number \| string |  —   | 300    | 图片尺寸,默认为 300                  |
| `imgX`    | number \| string |  —   | 0      | 水平裁剪偏移,方形图片可不传,默认为 0 |
| `imgY`    | number \| string |  —   | 0      | 垂直裁剪偏移,方形图片可不传,默认为 0 |

## HTTP 示例

```bash
GET /avatar/upload?imgSize=200
```

## 编程式调用

```ts
import { avatarUpload } from 'hana-music-api'

const result = await avatarUpload({
  imgSize: '200',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口，使用 `'Content-Type': 'multipart/form-data'` 上传图片 formData
（name 为 `imgFile`）即可更新头像。
参考：<https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/avatar_update.html>

**可选参数 :**

`imgSize` : 图片尺寸,默认为 300

`imgX` : 水平裁剪偏移,方形图片可不传,默认为 0
`imgY` : 垂直裁剪偏移,方形图片可不传,默认为 0

**接口地址 :** `/avatar/upload`

**调用例子 :** `/avatar/upload?imgSize=200`
