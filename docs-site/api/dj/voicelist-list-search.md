---
title: "播客声音搜索"
description: "可以搜索播客里的声音"
---

# 播客声音搜索

> 可以搜索播客里的声音

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/voicelist/list/search` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `voicelist_list_search` |
| 文档分类 | 电台与播客 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /voicelist/list/search
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.voicelist_list_search()

console.log(result.body)
```

## 补充说明

说明: 可以搜索播客里的声音

**接口地址:** `/voicelist/list/search`

**可选参数**  

- 状态（非必填）：
    - `displayStatus: null`（默认）：返回所有状态的声音
    - `displayStatus: "ONLINE"`：已发布的声音
    - `displayStatus: "AUDITING"`：审核中的声音
    - `displayStatus: "ONLY_SELF_SEE"`：尽自己可见的声音
    - `displayStatus: "SCHEDULE_PUBLISH"`：定时发布的声音
    - `displayStatus: "TRANSCODE_FAILED"`：上传失败的声音
    - `displayStatus: "PUBLISHING"`：发布中的声音
    - `displayStatus: "FAILED"`：发布失败的声音

- `limit: 20`：每次返回的声音数量（最多200个）

- 搜索关键词：
    - `name: null`：返回所有的声音
    - `name: [关键词]`：返回包含指定关键词的声音文件

- `offset: 0`：偏移量，用于分页，默认为0，表示从第一个声音开始获取

- 博客：
    - `radioId: null`：返回所有电台的声音
    - `radioId: [播客id]`：返回特定播客的声音

- 是否公开：
    - `type: null`：返回所有类型的声音
    - `type: "PUBLIC"`：返回公开的声音
    - `type: "PRIVATE"`：返回隐私的声音

- 是否付费：
    - `voiceFeeType: null`（默认）：返回所有类型的声音
    - `voiceFeeType: -1`：返回所有类型的声音
    - `voiceFeeType: 0`：返回免费的声音
    - `voiceFeeType: 1`：返回收费的声音

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
