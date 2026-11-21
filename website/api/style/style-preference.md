---
title: '曲风偏好'
description: '获取我的曲风偏好，匿名调用返回空偏好'
---

# 曲风偏好

获取我的曲风偏好，匿名调用返回空偏好

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                         |
| ---------- | ---------------------------------------------------------- |
| 接口地址   | `/style/preference`                                        |
| 请求方式   | `GET` / `POST`                                             |
| 需要登录   | 否（匿名返回空偏好）                                       |
| 对应模块   | `style_preference`                                         |
| SDK 函数   | `stylePreference`（`hana-music-api/api/style_preference`） |
| 返回体类型 | `StylePreferenceBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { stylePreference } from 'hana-music-api';

const result = await stylePreference();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/style/preference'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StylePreferenceBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/style_preference`、`hana-music-api/schemas/style_preference` 导入运行时校验器）。

```ts
type TagPreference = {
  tagId: number;
  tagName?: string | null;
  ratio?: string | null;
  picUrl?: string | null;
};

type StyleTagChild = {
  tagId?: number | null;
  tagName?: string | null;
  enName?: string | null;
  level?: number | null;
  picUrl?: string | null;
  colorDeep?: string | null;
  colorShallow?: string | null;
  link?: string | null;
  showText?: string | null;
  tabs?: Array<string> | null;
};

type StyleTagMiddle = {
  tagId?: number | null;
  tagName?: string | null;
  enName?: string | null;
  level?: number | null;
  picUrl?: string | null;
  colorDeep?: string | null;
  colorShallow?: string | null;
  link?: string | null;
  showText?: string | null;
  tabs?: Array<string> | null;
  childrenTags?: Array<StyleTagChild> | null;
};

type StyleTag = {
  tagId?: number | null;
  tagName?: string | null;
  enName?: string | null;
  level?: number | null;
  picUrl?: string | null;
  colorDeep?: string | null;
  colorShallow?: string | null;
  link?: string | null;
  showText?: string | null;
  tabs?: Array<string> | null;
  childrenTags?: Array<StyleTagMiddle> | null;
};

type StylePreferenceBody = {
  code: 200;
  data: {
    tagPreferenceVos: Array<TagPreference>;
    tags?: Array<StyleTag> | null;
  };
};
```

| 字段                              | 类型                    | 必填 | 说明                         |
| --------------------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                            | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                            | `object`                | 是   | 接口返回的数据主体           |
| `data.tagPreferenceVos`           | `Array<TagPreference>`  | 是   | -                            |
| `data.tagPreferenceVos[].tagId`   | `number`                | 是   | 曲风标签 ID                  |
| `data.tagPreferenceVos[].tagName` | `string`                | 否   | -                            |
| `data.tagPreferenceVos[].ratio`   | `string`                | 否   | -                            |
| `data.tagPreferenceVos[].picUrl`  | `string`                | 否   | 资源访问链接                 |
| `data.tags`                       | `Array<StyleTag>`       | 否   | 标签列表                     |
| `data.tags[].tagId`               | `number`                | 否   | 曲风标签 ID                  |
| `data.tags[].tagName`             | `string`                | 否   | -                            |
| `data.tags[].enName`              | `string`                | 否   | -                            |
| `data.tags[].level`               | `number`                | 否   | 当前等级                     |
| `data.tags[].picUrl`              | `string`                | 否   | 资源访问链接                 |
| `data.tags[].colorDeep`           | `string`                | 否   | -                            |
| `data.tags[].colorShallow`        | `string`                | 否   | -                            |
| `data.tags[].link`                | `string`                | 否   | -                            |
| `data.tags[].showText`            | `string`                | 否   | -                            |
| `data.tags[].tabs`                | `Array<string>`         | 否   | -                            |
| `data.tags[].childrenTags`        | `Array<StyleTagMiddle>` | 否   | -                            |

<!-- api-doc:response:end -->
