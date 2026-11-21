---
title: '获取视频点赞转发评论数数据'
description: '调用此接口，传入 vid ( 视频 id )，可获取对应视频点赞转发评论数数据'
---

# 获取视频点赞转发评论数数据

调用此接口，传入 vid ( 视频 id )，可获取对应视频点赞转发评论数数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/video/detail/info`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `video_detail_info`                                         |
| SDK 函数   | `videoDetailInfo`（`hana-music-api/api/video_detail_info`） |
| 返回体类型 | `VideoDetailInfoBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoDetailInfo } from 'hana-music-api';

const result = await videoDetailInfo({
  vid: '89ADDE33C0AAE8EC14B99F6750DB954D',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/video/detail/info' \
  --data-urlencode 'vid=89ADDE33C0AAE8EC14B99F6750DB954D'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型     | 必填 | 默认值 | 说明    |
| ----- | -------- | ---- | ------ | ------- |
| `vid` | `string` | 是   | -      | 视频 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoDetailInfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_detail_info`、`hana-music-api/schemas/video_detail_info` 导入运行时校验器）。

```ts
type VideoDetailInfoBody = {
  code: 200;
  commentCount: number;
  liked?: boolean | null;
  likedCount: number;
  shareCount: number;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `commentCount` | `number`  | 是   | 评论数                       |
| `liked`        | `boolean` | 否   | 是否已点赞                   |
| `likedCount`   | `number`  | 是   | 点赞数                       |
| `shareCount`   | `number`  | 是   | 分享数                       |

<!-- api-doc:response:end -->
