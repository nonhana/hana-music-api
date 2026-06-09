---
title: '云盘数据详情'
description: '登录后调用此接口 , 传入云盘歌曲 id，可获取云盘数据详情'
---

# 云盘数据详情

> 登录后调用此接口 , 传入云盘歌曲 id，可获取云盘数据详情

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/user/cloud/detail` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `user_cloud_detail`  |
| 文档分类 | 云盘与上传           |

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                      |
| ---- | ------------------ | :--: | ------ | ------------------------- |
| `id` | string[] \| string |  ✅  | -      | 歌曲 id,可多个,用逗号隔开 |

## HTTP 示例

```bash
GET /user/cloud/detail?id=5374627
```

## 编程式调用

```ts
import { userCloudDetail } from 'hana-music-api'

const result = await userCloudDetail({
  id: '5374627',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入云盘歌曲 id，可获取云盘数据详情

**必选参数 :** `id`: 歌曲 id,可多个,用逗号隔开

**接口地址 :** `/user/cloud/detail`

**调用例子 :** `/user/cloud/detail?id=5374627`
