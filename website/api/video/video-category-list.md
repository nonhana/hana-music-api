---
title: '获取视频分类列表'
description: '调用此接口，可获取视频分类列表'
---

# 获取视频分类列表

调用此接口，可获取视频分类列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/video/category/list`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 否                                                              |
| 对应模块   | `video_category_list`                                           |
| SDK 函数   | `videoCategoryList`（`hana-music-api/api/video_category_list`） |
| 返回体类型 | `VideoCategoryListBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoCategoryList } from 'hana-music-api';

const result = await videoCategoryList({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/video/category/list' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                         |
| -------- | -------- | ---- | ------ | ---------------------------- |
| `limit`  | `number` | 否   | `99`   | 返回数量，默认 `99`          |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoCategoryListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_category_list`、`hana-music-api/schemas/video_category_list` 导入运行时校验器）。

```ts
type VideoCategory = {
  id: number;
  name?: string | null;
  relatedVideoType?: string | null;
  selectTab?: boolean | null;
  url?: string | null;
};

type VideoCategoryListBody = {
  code: 200;
  message?: string | null;
  data: Array<VideoCategory>;
};
```

| 字段                      | 类型                   | 必填 | 说明                         |
| ------------------------- | ---------------------- | ---- | ---------------------------- |
| `code`                    | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `message`                 | `string`               | 否   | 返回说明信息                 |
| `data`                    | `Array<VideoCategory>` | 是   | 接口返回的数据主体           |
| `data[].id`               | `number`               | 是   | 记录 ID                      |
| `data[].name`             | `string`               | 否   | 名称                         |
| `data[].relatedVideoType` | `string`               | 否   | -                            |
| `data[].selectTab`        | `boolean`              | 否   | -                            |
| `data[].url`              | `string`               | 否   | 资源访问地址                 |

<!-- api-doc:response:end -->
