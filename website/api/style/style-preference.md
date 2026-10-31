---
title: '曲风偏好'
description: '获取我的曲风偏好，匿名调用返回空偏好'
---

# 曲风偏好

> 获取我的曲风偏好，匿名调用返回空偏好

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/style/preference` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否（匿名空偏好）    |
| 对应模块 | `style_preference`  |
| 文档分类 | 曲风                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /style/preference
```

## 编程式调用

```ts
import { stylePreference } from 'hana-music-api';

const result = await stylePreference();

console.log(result.body);
```

## 返回内容

曲风偏好在 `data.tagPreferenceVos`，每条偏好的 `tagId` 收紧；`data.tags` 的三层曲风树和 `ratio`、封面、链接等展示字段宽松。匿名调用返回两个空数组，结构定义接受。结构定义和类型是 `StylePreferenceBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 获取我的曲风偏好；匿名调用返回空 `tagPreferenceVos` 和 `tags`。

**接口地址:** `/style/preference`

**调用例子:** `/style/preference`
