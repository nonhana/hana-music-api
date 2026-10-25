---
title: 'mv 地址'
description: '调用此接口，传入 mv id,可获取 mv 播放地址'
---

# mv 地址

> 调用此接口，传入 mv id,可获取 mv 播放地址

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/url`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_url`       |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                                                  |
| ---- | ------------------ | :--: | ------ | ----------------------------------------------------- |
| `id` | string             |  ✅  | -      | mv id                                                 |
| `r`  | string[] \| string |  —   | 1080   | 分辨率,默认 1080,可从 `/mv/detail` 接口获取分辨率列表 |

## HTTP 示例

```bash
GET /mv/url?id=5436712
GET /mv/url?id=10896407&r=1080
```

## 编程式调用

```ts
import { mvUrl } from 'hana-music-api';

const result = await mvUrl({
  id: '5436712',
});

console.log(result.body);
```

## 返回内容

`body.code`、地址对象 `body.data`、视频编号 `data.id`、地址 `data.url` 和该项返回码 `data.code` 收紧；`url` 拿不到地址时是 `null`，原因看 `data.code`（录制 `mv_url.unavailable.json` 时上游间歇返回 `-125`），不要把它当成稳定的版权状态。`r`、`size`、`md5`、`expi`、`msg` 等是宽松字段。录制覆盖默认 1080p、720p（`mv_url.default.json`、`mv_url.720p.json`）和不可用场景。结构定义和类型是 `MvUrlBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入 mv id,可获取 mv 播放地址

**必选参数 :** `id`: mv id

**可选参数 :** `r`: 分辨率,默认 1080,可从 `/mv/detail` 接口获取分辨率列表

**接口地址 :** `/mv/url`

**调用例子 :**

`/mv/url?id=5436712` `/mv/url?id=10896407&r=1080`
