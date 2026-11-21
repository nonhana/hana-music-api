---
title: '获取话题详情'
description: '调用此接口，可获取话题详情'
---

# 获取话题详情

调用此接口，可获取话题详情

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/topic/detail`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `topic_detail`                                     |
| SDK 函数   | `topicDetail`（`hana-music-api/api/topic_detail`） |
| 返回体类型 | `TopicDetailBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topicDetail } from 'hana-music-api';

const result = await topicDetail({
  actid: '111551188',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/topic/detail' \
  --data-urlencode 'actid=111551188'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明    |
| ------- | ------------------ | ---- | ------ | ------- |
| `actid` | `number \| string` | 是   | -      | 话题 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopicDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/topic_detail`、`hana-music-api/schemas/topic_detail` 导入运行时校验器）。

```ts
type Act = {
  actId: number;
  coverId?: number | null;
  coverMobileUrl?: string | null;
  coverPCId?: number | null;
  coverPCIdList?: number | null;
  coverPCIdLong?: number | null;
  coverPCListUrl?: string | null;
  coverPCLongUrl?: string | null;
  coverPCUrl?: string | null;
  displayType?: number | null;
  enableResourcePublish?: boolean | null;
  endTime?: number | null;
  isDefaultImg?: boolean | null;
  meetingBeginTime?: number | null;
  meetingEndTime?: number | null;
  participateCount?: number | null;
  publishTip?: string | null;
  resourceJson?: string | null;
  resourceType?: number | null;
  sharePicId?: number | null;
  sharePicUrl?: string | null;
  startTime?: number | null;
  text?: Array<string> | null;
  title?: string | null;
  topicType?: number | null;
  videoType?: number | null;
};

type TopicDetailBody = {
  code: 200;
  act: Act;
  needBeginNotify?: boolean | null;
};
```

| 字段              | 类型      | 必填 | 说明                         |
| ----------------- | --------- | ---- | ---------------------------- |
| `code`            | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `act`             | `Act`     | 是   | -                            |
| `needBeginNotify` | `boolean` | 否   | -                            |

<!-- api-doc:response:end -->
