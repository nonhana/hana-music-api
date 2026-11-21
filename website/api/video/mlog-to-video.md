---
title: '将 mlog id 转为视频 id'
description: '调用此接口，传入 mlog id，可获取 video id，然后通过`video/url` 获取播放地址'
---

<!-- cSpell:ignore OVPTWKS -->

# 将 mlog id 转为视频 id

调用此接口，传入 mlog id，可获取 video id，然后通过`video/url` 获取播放地址

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                  |
| ---------- | --------------------------------------------------- |
| 接口地址   | `/mlog/to/video`                                    |
| 请求方式   | `GET` / `POST`                                      |
| 需要登录   | 否                                                  |
| 对应模块   | `mlog_to_video`                                     |
| SDK 函数   | `mlogToVideo`（`hana-music-api/api/mlog_to_video`） |
| 返回体类型 | `MlogToVideoBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mlogToVideo } from 'hana-music-api';

const result = await mlogToVideo({
  id: 'a1qOVPTWKS1ZrK8',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mlog/to/video' \
  --data-urlencode 'id=a1qOVPTWKS1ZrK8'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型     | 必填 | 默认值 | 说明    |
| ---- | -------- | ---- | ------ | ------- |
| `id` | `string` | 是   | -      | mlog id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MlogToVideoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mlog_to_video`、`hana-music-api/schemas/mlog_to_video` 导入运行时校验器）。

```ts
type MlogToVideoBody = {
  code: 200;
  data: string;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `string` | 是   | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **返回值说明**：转换成功后 `data` 返回长度为 32 位的十六进制视频 ID 字符串。
