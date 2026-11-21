---
title: '获取视频播放地址'
description: '调用此接口，传入视频 id，可获取视频播放地址'
---

# 获取视频播放地址

调用此接口，传入视频 id，可获取视频播放地址

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/video/url`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `video_url`                                  |
| SDK 函数   | `videoUrl`（`hana-music-api/api/video_url`） |
| 返回体类型 | `VideoUrlBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoUrl } from 'hana-music-api';

const result = await videoUrl({
  id: '89ADDE33C0AAE8EC14B99F6750DB954D',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/video/url' \
  --data-urlencode 'id=89ADDE33C0AAE8EC14B99F6750DB954D'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型     | 必填 | 默认值 | 说明                                                      |
| ----- | -------- | ---- | ------ | --------------------------------------------------------- |
| `id`  | `string` | 是   | -      | 视频 的 id                                                |
| `res` | `number` | 否   | `1080` | 目标分辨率（如 `1080`、`720`、`480`、`240`），默认 `1080` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoUrlBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_url`、`hana-music-api/schemas/video_url` 导入运行时校验器）。

```ts
type VideoUrl = {
  id: string;
  url: string;
  needPay?: boolean | null;
  r?: number | null;
  size?: number | null;
  validityTime?: number | null;
};

type VideoUrlBody = {
  code: 200;
  urls: Array<VideoUrl>;
};
```

| 字段                  | 类型              | 必填 | 说明                         |
| --------------------- | ----------------- | ---- | ---------------------------- |
| `code`                | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `urls`                | `Array<VideoUrl>` | 是   | 播放或下载链接列表           |
| `urls[].id`           | `string`          | 是   | 记录 ID                      |
| `urls[].url`          | `string`          | 是   | 资源访问地址                 |
| `urls[].needPay`      | `boolean`         | 否   | -                            |
| `urls[].r`            | `number`          | 否   | -                            |
| `urls[].size`         | `number`          | 否   | -                            |
| `urls[].validityTime` | `number`          | 否   | 时间戳                       |

<!-- api-doc:response:end -->
