---
title: "播客声音排序"
description: "调整声音在列表中的顺序, 每个声音都有固定的序号, 例如将4的声音移动到1后, 原来的1、2、3增加为2、3、4, 其他不变"
---

# 播客声音排序

> 调整声音在列表中的顺序, 每个声音都有固定的序号, 例如将4的声音移动到1后, 原来的1、2、3增加为2、3、4, 其他不变

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/voicelist/trans` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `voicelist_trans` |
| 文档分类 | 电台与播客 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /voicelist/trans
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.voicelist_trans()

console.log(result.body)
```

## 补充说明

说明: 调整声音在列表中的顺序, 每个声音都有固定的序号, 例如将4的声音移动到1后, 原来的1、2、3增加为2、3、4, 其他不变

**接口地址:** `/voicelist/trans`

**必选参数：** 
`limit`: 取出歌单数量 , 默认为 200

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*200, 其中 200 为 limit 的值

`position`: 位置, 最小为1, 最大为歌曲数量, 超过最大则为移动到最底, 小于1报错

`programId`: 播客声音id, 即voiceId

`radioId`: 电台id, 即voiceListId

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
