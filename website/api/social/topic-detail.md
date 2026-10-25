---
title: '获取话题详情'
description: '调用此接口，可获取话题详情'
---

# 获取话题详情

> 调用此接口，可获取话题详情

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/topic/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `topic_detail`  |
| 文档分类 | 社交与消息      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /topic/detail?actid=111551188
```

## 编程式调用

```ts
import { topicDetail } from 'hana-music-api';

const result = await topicDetail({
  actid: '111551188',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.act` 和话题自己的编号 `body.act.actId` 收紧。`title`、`text`、封面 URL/ID、`resourceJson`（JSON 字符串）、参与人数和时间字段都是宽松字段；`commodityInfo` 只见过 `null` 没有声明。未知话题由上游返回 `code: 404`（录制 `topic_detail.unknown.json`），SDK 按业务拒绝原样转交，不报 502；`needBeginNotify` 宽松。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `topic_detail.missing-actid.json`，未知话题的 `code:404` 录制见 `topic_detail.unknown.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。`SPECIAL_STATUS_CODES` 里的其他码（201/302/502 以原码拒绝，800–803 钳位为 400）同样以 `status=业务码` 拒绝；不在该表里的码（如 404）原样转交。

## 补充说明

说明 : 调用此接口，可获取话题详情

**接口地址 :** `/topic/detail`

**调用例子 :** `/topic/detail?actid=111551188`
