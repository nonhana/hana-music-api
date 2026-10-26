---
title: '资源点赞( MV,电台,视频)'
description: '调用此接口，可对 MV,电台,视频点赞'
---

# 资源点赞( MV,电台,视频)

> 调用此接口，可对 MV,电台,视频点赞

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/resource/like` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `resource_like`  |
| 文档分类 | 社交与消息       |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                                                                                            |
| ------ | ------ | :--: | ------ | --------------------------------------------------------------------------------------------------------------- |
| `type` | string |  ✅  | -      | 资源类型,对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |
| `t`    | string |  ✅  | -      | 操作,1 为点赞,其他为取消点赞                                                                                    |
| `id`   | string |  ✅  | -      | 资源 id                                                                                                         |

## HTTP 示例

```bash
GET /resource/like?t=1&type=1&id=5436712
GET /resource/like?t=1&type=6&threadId=A_EV_2_6559519868_32953014
```

## 编程式调用

```ts
import { resourceLike } from 'hana-music-api';

const result = await resourceLike({
  t: '1',
  type: '1',
  id: '5436712',
});

console.log(result.body);
```

## 返回内容

`body.code` 是接口要拿的操作结果，收紧为 `200`，其余字段原样保留。点赞方向在录制设备上被上游风控拒绝（正文 `code: 250`、`msg` 是设备风险提示），SDK 按业务拒绝原样转交，`status` 为 250；成功正文只有取消点赞的证据。结构定义和类型是 `ResourceLikeBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可对 MV,电台,视频点赞

**必选参数 :**

`type`:资源类型,对应以下类型

```text
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台节目

5: 视频

6: 动态

7: 电台
```

`t`: 操作,1 为点赞,其他为取消点赞

`id`: 资源 id

**接口地址 :** `/resource/like`

**调用例子 :** `/resource/like?t=1&type=1&id=5436712`

注意：如给动态点赞，不需要传入 id，需要传入 `threadId`,可通过 `event`,`/user/event` 接口获取，如：
`/resource/like?t=1&type=6&threadId=A_EV_2_6559519868_32953014`
