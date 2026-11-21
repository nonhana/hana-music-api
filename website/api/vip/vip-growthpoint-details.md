---
title: 'vip 成长值获取记录'
description: '登录后调用此接口可获取会员成长值领取记录'
---

# vip 成长值获取记录

登录后调用此接口可获取会员成长值领取记录

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| 接口地址   | `/vip/growthpoint/details`                                              |
| 请求方式   | `GET` / `POST`                                                          |
| 需要登录   | 是                                                                      |
| 对应模块   | `vip_growthpoint_details`                                               |
| SDK 函数   | `vipGrowthpointDetails`（`hana-music-api/api/vip_growthpoint_details`） |
| 返回体类型 | `VipGrowthpointDetailsBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipGrowthpointDetails } from 'hana-music-api';

const result = await vipGrowthpointDetails(
  {
    limit: 10,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/vip/growthpoint/details' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                              |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------- |
| `limit`  | `number` | 否   | `20`   | 取出评论数量，默认为 20                                           |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*10，其中 10 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VipGrowthpointDetailsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/vip_growthpoint_details`、`hana-music-api/schemas/vip_growthpoint_details` 导入运行时校验器）。

```ts
type GrowthDetail = {
  resourceId?: number | null;
  descript?: string | null;
  growthPoint?: number | null;
  time?: number | null;
};

type VipGrowthpointDetailsBody = {
  code: 200;
  data: {
    details: Array<GrowthDetail>;
    hasMore?: boolean | null;
    maxTaskScore?: number | null;
    scoreDuration?: number | null;
  };
  message?: string | null;
};
```

| 字段                         | 类型                  | 必填 | 说明                         |
| ---------------------------- | --------------------- | ---- | ---------------------------- |
| `code`                       | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`                       | `object`              | 是   | 接口返回的数据主体           |
| `data.details`               | `Array<GrowthDetail>` | 是   | 明细列表                     |
| `data.details[].resourceId`  | `number`              | 否   | 资源 ID                      |
| `data.details[].descript`    | `string`              | 否   | -                            |
| `data.details[].growthPoint` | `number`              | 否   | 当前成长值                   |
| `data.details[].time`        | `number`              | 否   | 时间戳                       |
| `data.hasMore`               | `boolean`             | 否   | 是否还有更多数据             |
| `data.maxTaskScore`          | `number`              | 否   | -                            |
| `data.scoreDuration`         | `number`              | 否   | -                            |
| `message`                    | `string`              | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
