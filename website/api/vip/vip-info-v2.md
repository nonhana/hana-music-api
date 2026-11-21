---
title: '获取 VIP 信息(app端)'
description: '登录后调用此接口，可获取当前 VIP 信息。'
---

# 获取 VIP 信息(app端)

登录后调用此接口，可获取当前 VIP 信息。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                              |
| ---------- | ----------------------------------------------- |
| 接口地址   | `/vip/info/v2`                                  |
| 请求方式   | `GET` / `POST`                                  |
| 需要登录   | 是                                              |
| 对应模块   | `vip_info_v2`                                   |
| SDK 函数   | `vipInfoV2`（`hana-music-api/api/vip_info_v2`） |
| 返回体类型 | `VipInfoV2Body`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipInfoV2 } from 'hana-music-api';

const result = await vipInfoV2(
  {
    uid: 32953014,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/vip/info/v2' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明    |
| ----- | ------------------ | ---- | ------ | ------- |
| `uid` | `number \| string` | 否   | -      | 用户 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VipInfoV2Body`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/vip_info_v2`、`hana-music-api/schemas/vip_info_v2` 导入运行时校验器）。

```ts
type VipRight = {
  expireTime?: number | null;
  isSign?: boolean | null;
  isSignDeduct?: boolean | null;
  isSignIap?: boolean | null;
  isSignIapDeduct?: boolean | null;
  vipCode?: number | null;
  vipLevel?: number | null;
};

type VipInfoV2Body = {
  code: 200;
  data: {
    albumVip?: VipRight | null;
    associator?: VipRight | null;
    musicPackage?: VipRight | null;
    now?: number | null;
    oldCacheProtocol?: boolean | null;
    redVipAnnualCount?: number | null;
    redVipLevel?: number | null;
    redplus?: VipRight | null;
    relationOtherUserId?: number | null;
    relationOtherUserRedVipExpireTime?: number | null;
    relationType?: number | null;
    userId?: number | null;
    voiceBookVip?: VipRight | null;
  };
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `object` | 是   | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
