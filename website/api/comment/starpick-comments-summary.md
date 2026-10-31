---
title: '云村星评馆 - 简要评论'
description: '调用此接口可以获取首页推荐的星评馆评论信息'
---

# 云村星评馆 - 简要评论

> 调用此接口可以获取首页推荐的星评馆评论信息

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/starpick/comments/summary` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `starpick_comments_summary`  |
| 文档分类 | 评论                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /starpick/comments/summary
```

## 编程式调用

```ts
import { starpickCommentsSummary } from 'hana-music-api';

const result = await starpickCommentsSummary();

console.log(result.body);
```

## 返回内容

接口实际返回首页 block 页；`body.code`、通到 block 列表的 `data.blocks` 和每个 block 自己的编号 `blockCode` 收紧。星评评论在 `HOMEPAGE_BLOCK_NEW_HOT_COMMENT` block 的 `creatives[].resources[]` 里，`creatives` 是可以没有的路径：banner 这类 block 没有 `creatives`，缺失或 `null` 照常返回，出现时里面的记录仍会校验。`resources` 和每个 creative 的 `uiElement` 是宽松字段，坏值只丢该项；block 的 `extInfo` 未声明、原样保留，其余展示字段全部宽松。录制保留 banner、歌单推荐和星评评论三个 block（原 15 个），有 creative 的 block 保留两条 creative、每条 creative 保留一条 resource，`context.truncated` 记原长度；没有可达的空 block 结果。结构定义和类型是 `StarpickCommentsSummaryBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可以获取首页推荐的星评馆评论信息

**接口地址:** `/starpick/comments/summary`
