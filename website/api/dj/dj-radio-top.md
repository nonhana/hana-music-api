---
title: '电台排行榜获取'
description: '调用此接口可以获取电台排行榜'
---

# 电台排行榜获取

调用此接口可以获取电台排行榜

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/djRadio/top`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `djRadio_top`                                    |
| SDK 函数   | `djRadioTop`（`hana-music-api/api/djRadio_top`） |
| 返回体类型 | `DjRadioTopBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djRadioTop } from 'hana-music-api';

const result = await djRadioTop(
  {
    dataGapDays: 7,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/djRadio/top' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'dataGapDays=7'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型                    | 必填 | 默认值 | 说明                                                        |
| ------------- | ----------------------- | ---- | ------ | ----------------------------------------------------------- |
| `dataGapDays` | `7 \| 30 \| 90`         | 否   | `7`    | 天数 7:一周 30:一个月 90:三个月 默认 7                      |
| `dataType`    | `number`                | 否   | `3`    | 未知，默认 3                                                |
| `djRadioId`   | `number \| string`      | 否   | -      | 电台id                                                      |
| `sortIndex`   | `1 \| 2 \| 3 \| 4 \| 5` | 否   | `1`    | 排序 1:播放数 2:点赞数 3：评论数 4：分享数 5：收藏数 默认 1 |

| `sortIndex` | 排序指标       |
| ----------- | -------------- |
| `1`         | 播放数（默认） |
| `2`         | 点赞数         |
| `3`         | 评论数         |
| `4`         | 分享数         |
| `5`         | 收藏数         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjRadioTopBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/djRadio_top`、`hana-music-api/schemas/djRadio_top` 导入运行时校验器）。

```ts
type DjRadioTopBody =
  | {
      code: 200;
      message?: string | null;
    }
  | '';
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->
