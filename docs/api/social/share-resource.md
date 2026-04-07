---
title: '分享文本、歌曲、歌单、mv、电台、电台节目到动态'
description: '登录后调用此接口 ,可以分享文本、歌曲、歌单、mv、电台、电台节目,专辑到动态'
---

# 分享文本、歌曲、歌单、mv、电台、电台节目到动态

> 登录后调用此接口 ,可以分享文本、歌曲、歌单、mv、电台、电台节目,专辑到动态

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/share/resource` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `share_resource`  |
| 文档分类 | 社交与消息        |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                                                                                             |
| ------ | ------ | :--: | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `id`   | string |  ✅  | -      | 资源 id （歌曲，歌单，mv，电台，电台节目对应 id）                                                                |
| `type` | string |  —   | 歌曲   | 资源类型，默认歌曲 song，可传 `song`,`playlist`,`mv`,`djradio`,`djprogram`, `album`                              |
| `msg`  | string |  —   | -      | 内容，140 字限制，支持 emoji，@用户名（`/user/follows`接口获取的用户名，用户名后和内容应该有空格），图片暂不支持 |

## HTTP 示例

```bash
GET /share/resource?id=1297494209&msg=测试
GET /share/resource?type=djradio&id=336355127
GET /share/resource?type=djprogram&id=2061034798
GET /share/resource?type=djprogram&id=2061034798&msg=测试@binaryify
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.share_resource({
  id: '1297494209',
  msg: '测试',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可以分享文本、歌曲、歌单、mv、电台、电台节目,专辑到动态

**必选参数 :** `id` : 资源 id （歌曲，歌单，mv，电台，电台节目对应 id）

**可选参数 :** `type`: 资源类型，默认歌曲 song，可传 `song`,`playlist`,`mv`,`djradio`,`djprogram`, `album`

`msg`: 内容，140 字限制，支持 emoji，@用户名（`/user/follows`接口获取的用户名，用户名后和内容应该有空格），图片暂不支持

**接口地址 :** `/share/resource`

**调用例子 :** `/share/resource?id=1297494209&msg=测试` `/share/resource?type=djradio&id=336355127` `/share/resource?type=djprogram&id=2061034798` `/share/resource?type=djprogram&id=2061034798&msg=测试@binaryify 测试` `/share/resource?type=noresource&msg=测试`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
