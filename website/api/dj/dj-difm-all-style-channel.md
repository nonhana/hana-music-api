---
title: 'DIFM电台 - 分类'
description: '调用此接口，获取DIFM电台分类'
---

# DIFM电台 - 分类

调用此接口，获取DIFM电台分类

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| 接口地址   | `/dj/difm/all/style/channel`                                              |
| 请求方式   | `GET` / `POST`                                                            |
| 需要登录   | 否                                                                        |
| 对应模块   | `dj_difm_all_style_channel`                                               |
| SDK 函数   | `djDifmAllStyleChannel`（`hana-music-api/api/dj_difm_all_style_channel`） |
| 返回体类型 | `DjDifmAllStyleChannelBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djDifmAllStyleChannel } from 'hana-music-api';

const result = await djDifmAllStyleChannel({
  sources: [0],
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/dj/difm/all/style/channel' \
  -H 'Content-Type: application/json' \
  --data '{"sources":[0]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型                 | 必填 | 默认值 | 说明                                          |
| --------- | -------------------- | ---- | ------ | --------------------------------------------- |
| `sources` | `Array<0 \| 1 \| 2>` | 否   | `[0]`  | 来源列表，0: 最嗨电音 1: 古典电台 2: 爵士电台 |

| `sources` 元素 | 来源             |
| -------------- | ---------------- |
| `0`            | 最嗨电音（默认） |
| `1`            | 古典电台         |
| `2`            | 爵士电台         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjDifmAllStyleChannelBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_difm_all_style_channel`、`hana-music-api/schemas/dj_difm_all_style_channel` 导入运行时校验器）。

```ts
type Channel = {
  id: number;
  blurCover?: string | null;
  chineseName?: string | null;
  cover?: string | null;
  description?: string | null;
  name?: string | null;
  radar?: Array<number> | null;
  source?: number | null;
};

type Style = {
  channels: Array<Channel>;
  chineseName?: string | null;
  description?: string | null;
  id?: number | null;
  name?: string | null;
  show?: number | null;
  source?: number | null;
};

type SourceGroup = {
  styles: Array<Style>;
  source?: number | null;
};

type DjDifmAllStyleChannelBody = {
  code: 200;
  data: Array<SourceGroup>;
  message?: string | null;
};
```

| 字段                          | 类型                 | 必填 | 说明                         |
| ----------------------------- | -------------------- | ---- | ---------------------------- |
| `code`                        | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `data`                        | `Array<SourceGroup>` | 是   | 接口返回的数据主体           |
| `data[].styles`               | `Array<Style>`       | 是   | -                            |
| `data[].styles[].channels`    | `Array<Channel>`     | 是   | -                            |
| `data[].styles[].chineseName` | `string`             | 否   | -                            |
| `data[].styles[].description` | `string`             | 否   | 描述信息                     |
| `data[].styles[].id`          | `number`             | 否   | 记录 ID                      |
| `data[].styles[].name`        | `string`             | 否   | 名称                         |
| `data[].styles[].show`        | `number`             | 否   | -                            |
| `data[].styles[].source`      | `number`             | 否   | -                            |
| `data[].source`               | `number`             | 否   | -                            |
| `message`                     | `string`             | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
