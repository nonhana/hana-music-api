---
title: '获取视频标签列表'
description: '调用此接口，可获取视频标签列表'
---

# 获取视频标签列表

调用此接口，可获取视频标签列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                        |
| ---------- | --------------------------------------------------------- |
| 接口地址   | `/video/group/list`                                       |
| 请求方式   | `GET` / `POST`                                            |
| 需要登录   | 否                                                        |
| 对应模块   | `video_group_list`                                        |
| SDK 函数   | `videoGroupList`（`hana-music-api/api/video_group_list`） |
| 返回体类型 | `VideoGroupListBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoGroupList } from 'hana-music-api';

const result = await videoGroupList();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/video/group/list'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoGroupListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_group_list`、`hana-music-api/schemas/video_group_list` 导入运行时校验器）。

```ts
type VideoGroupTag = {
  id: number;
  name?: string | null;
  url?: string | null;
  selectTab?: boolean | null;
};

type VideoGroupListBody = {
  code: 200;
  message?: string | null;
  data: Array<VideoGroupTag>;
};
```

| 字段               | 类型                   | 必填 | 说明                         |
| ------------------ | ---------------------- | ---- | ---------------------------- |
| `code`             | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `message`          | `string`               | 否   | 返回说明信息                 |
| `data`             | `Array<VideoGroupTag>` | 是   | 接口返回的数据主体           |
| `data[].id`        | `number`               | 是   | 记录 ID                      |
| `data[].name`      | `string`               | 否   | 名称                         |
| `data[].url`       | `string`               | 否   | 资源访问地址                 |
| `data[].selectTab` | `boolean`              | 否   | -                            |

<!-- api-doc:response:end -->
