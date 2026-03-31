---
title: "banner"
description: "调用此接口 , 可获取 banner( 轮播图 ) 数据"
---

# banner

> 调用此接口 , 可获取 banner( 轮播图 ) 数据

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/banner` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `banner` |
| 文档分类 | 推荐与发现 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `type` | string | — | 0 | 资源类型,对应以下类型,默认为 0 即 PC<br>0: pc<br>1: android<br>2: iphone<br>3: ipad |

## HTTP 示例

```bash
GET /banner
GET /banner?type=2
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.banner()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取 banner( 轮播图 ) 数据

**可选参数 :**

`type`:资源类型,对应以下类型,默认为 0 即 PC  

```
0: pc

1: android

2: iphone

3: ipad
```  

**接口地址 :** `/banner`

**调用例子 :** `/banner`, `/banner?type=2`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
