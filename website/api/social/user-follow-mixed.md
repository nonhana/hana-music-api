---
title: '当前账号关注的用户/歌手'
description: '调用此接口, 可获得当前账号关注的用户/歌手'
---

# 当前账号关注的用户/歌手

> 调用此接口, 可获得当前账号关注的用户/歌手

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/user/follow/mixed` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `user_follow_mixed`  |
| 文档分类 | 社交与消息           |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                          |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------------- |
| `size`   | number \| string |  —   | 30     | 返回数量，默认为 30                                                           |
| `cursor` | number \| string |  —   | 0      | 返回数据的 cursor, 默认为 0，传入上一次返回结果的 cursor,将会返回下一页的数据 |
| `scene`  | string           |  —   | 0      | 场景, 0 表示所有关注, 1 表示关注的歌手, 2 表示关注的用户, 默认为 0            |

## HTTP 示例

```bash
GET /user/follow/mixed?scene=1
```

## 编程式调用

```ts
import { userFollowMixed } from 'hana-music-api';

const result = await userFollowMixed({
  scene: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data`、`body.data.records` 和每条记录的 `body.data.records[].followId` 收紧；越界 `cursor` 返回空数组（录制 `user_follow_mixed.empty.json`）。`type` 为 2 的艺术家记录里 `userProfile` 是 `null`，所以 `userProfile` 是可以没有的路径；出现时按用户对象校验，里面的 `userId` 是附带对象的编号、保持宽松。`artistInfo`、`fansGroupInfo`、`showContent`、`page`、`extData` 宽松。未登录调用上游返回 HTTP 200、`code: 400`、`message: "not login"`（录制 `user_follow_mixed.anonymous.json`），SDK 按业务拒绝原样转交。结构定义和类型是 `UserFollowMixedBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口, 可获得当前账号关注的用户/歌手

**可选参数 :** `size` : 返回数量，默认为 30

`cursor` : 返回数据的 cursor, 默认为 0，传入上一次返回结果的 cursor,将会返回下一页的数据

`scene` : 场景, 0 表示所有关注, 1 表示关注的歌手, 2 表示关注的用户, 默认为 0

**接口地址 :** `/user/follow/mixed`

**调用例子 :** `/user/follow/mixed?scene=1`
