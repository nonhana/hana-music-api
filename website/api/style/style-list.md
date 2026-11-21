---
title: '曲风列表'
description: '调用此接口获取曲风列表及其对应的 `tagId`'
---

# 曲风列表

调用此接口获取曲风列表及其对应的 `tagId`

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/style/list`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `style_list`                                   |
| SDK 函数   | `styleList`（`hana-music-api/api/style_list`） |
| 返回体类型 | `StyleListBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { styleList } from 'hana-music-api';

const result = await styleList();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/style/list'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StyleListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/style_list`、`hana-music-api/schemas/style_list` 导入运行时校验器）。

```ts
type LeafTag = {
  colorDeep?: string | null;
  colorShallow?: string | null;
  enName?: string | null;
  level?: number | null;
  link?: string | null;
  picUrl?: string | null;
  showText?: string | null;
  tabs?: Array<string> | null;
  tagName?: string | null;
  tagId?: number | null;
};

type ChildTag = {
  colorDeep?: string | null;
  colorShallow?: string | null;
  enName?: string | null;
  level?: number | null;
  link?: string | null;
  picUrl?: string | null;
  showText?: string | null;
  tabs?: Array<string> | null;
  tagName?: string | null;
  tagId?: number | null;
  childrenTags?: Array<LeafTag> | null;
};

type Tag = {
  colorDeep?: string | null;
  colorShallow?: string | null;
  enName?: string | null;
  level?: number | null;
  link?: string | null;
  picUrl?: string | null;
  showText?: string | null;
  tabs?: Array<string> | null;
  tagName?: string | null;
  tagId: number;
  childrenTags?: Array<ChildTag> | null;
};

type StyleListBody = {
  code: 200;
  data: Array<Tag>;
};
```

| 字段                                 | 类型              | 必填 | 说明                         |
| ------------------------------------ | ----------------- | ---- | ---------------------------- |
| `code`                               | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`                               | `Array<Tag>`      | 是   | 接口返回的数据主体           |
| `data[].colorDeep`                   | `string`          | 否   | -                            |
| `data[].colorShallow`                | `string`          | 否   | -                            |
| `data[].enName`                      | `string`          | 否   | -                            |
| `data[].level`                       | `number`          | 否   | 当前等级                     |
| `data[].link`                        | `string`          | 否   | -                            |
| `data[].picUrl`                      | `string`          | 否   | 资源访问链接                 |
| `data[].showText`                    | `string`          | 否   | -                            |
| `data[].tabs`                        | `Array<string>`   | 否   | -                            |
| `data[].tagName`                     | `string`          | 否   | -                            |
| `data[].tagId`                       | `number`          | 是   | 曲风标签 ID                  |
| `data[].childrenTags`                | `Array<ChildTag>` | 否   | -                            |
| `data[].childrenTags[].colorDeep`    | `string`          | 否   | -                            |
| `data[].childrenTags[].colorShallow` | `string`          | 否   | -                            |
| `data[].childrenTags[].enName`       | `string`          | 否   | -                            |
| `data[].childrenTags[].level`        | `number`          | 否   | 当前等级                     |
| `data[].childrenTags[].link`         | `string`          | 否   | -                            |
| `data[].childrenTags[].picUrl`       | `string`          | 否   | 资源访问链接                 |
| `data[].childrenTags[].showText`     | `string`          | 否   | -                            |
| `data[].childrenTags[].tabs`         | `Array<string>`   | 否   | -                            |
| `data[].childrenTags[].tagName`      | `string`          | 否   | -                            |
| `data[].childrenTags[].tagId`        | `number`          | 否   | 曲风标签 ID                  |
| `data[].childrenTags[].childrenTags` | `Array<LeafTag>`  | 否   | -                            |

<!-- api-doc:response:end -->
