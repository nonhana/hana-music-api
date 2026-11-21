---
title: '获取 VIP 信息'
description: '登录后调用此接口，可获取当前 VIP 信息。'
---

# 获取 VIP 信息

登录后调用此接口，可获取当前 VIP 信息。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/vip/info`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 是                                         |
| 对应模块   | `vip_info`                                 |
| SDK 函数   | `vipInfo`（`hana-music-api/api/vip_info`） |
| 返回体类型 | `VipInfoBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipInfo } from 'hana-music-api';

const result = await vipInfo(
  {
    uid: 32953014,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/vip/info' \
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

返回体类型：`VipInfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/vip_info`、`hana-music-api/schemas/vip_info` 导入运行时校验器）。

```ts
type VipRight = {
  dynamicIconUrl?: string | null;
  expireTime?: number | null;
  iconUrl?: string | null;
  isSign?: boolean | null;
  isSignDeduct?: boolean | null;
  isSignIap?: boolean | null;
  isSignIapDeduct?: boolean | null;
  vipCode?: number | null;
  vipLevel?: number | null;
};

type VipInfoBody = {
  code: 200;
  data: {
    associator?: VipRight | null;
    familyVip?: VipRight | null;
    musicPackage?: VipRight | null;
    redVipAnnualCount?: number | null;
    redVipLevel?: number | null;
    redVipLevelIcon?: string | null;
    redplus?: VipRight | null;
  };
  message?: string | null;
};
```

| 字段                                | 类型       | 必填 | 说明                         |
| ----------------------------------- | ---------- | ---- | ---------------------------- |
| `code`                              | `200`      | 是   | 业务状态码（`200` 表示成功） |
| `data`                              | `object`   | 是   | 接口返回的数据主体           |
| `data.associator`                   | `VipRight` | 否   | -                            |
| `data.associator.dynamicIconUrl`    | `string`   | 否   | 资源访问链接                 |
| `data.associator.expireTime`        | `number`   | 否   | 时间戳                       |
| `data.associator.iconUrl`           | `string`   | 否   | 资源访问链接                 |
| `data.associator.isSign`            | `boolean`  | 否   | -                            |
| `data.associator.isSignDeduct`      | `boolean`  | 否   | -                            |
| `data.associator.isSignIap`         | `boolean`  | 否   | -                            |
| `data.associator.isSignIapDeduct`   | `boolean`  | 否   | -                            |
| `data.associator.vipCode`           | `number`   | 否   | -                            |
| `data.associator.vipLevel`          | `number`   | 否   | -                            |
| `data.familyVip`                    | `VipRight` | 否   | -                            |
| `data.familyVip.dynamicIconUrl`     | `string`   | 否   | 资源访问链接                 |
| `data.familyVip.expireTime`         | `number`   | 否   | 时间戳                       |
| `data.familyVip.iconUrl`            | `string`   | 否   | 资源访问链接                 |
| `data.familyVip.isSign`             | `boolean`  | 否   | -                            |
| `data.familyVip.isSignDeduct`       | `boolean`  | 否   | -                            |
| `data.familyVip.isSignIap`          | `boolean`  | 否   | -                            |
| `data.familyVip.isSignIapDeduct`    | `boolean`  | 否   | -                            |
| `data.familyVip.vipCode`            | `number`   | 否   | -                            |
| `data.familyVip.vipLevel`           | `number`   | 否   | -                            |
| `data.musicPackage`                 | `VipRight` | 否   | -                            |
| `data.musicPackage.dynamicIconUrl`  | `string`   | 否   | 资源访问链接                 |
| `data.musicPackage.expireTime`      | `number`   | 否   | 时间戳                       |
| `data.musicPackage.iconUrl`         | `string`   | 否   | 资源访问链接                 |
| `data.musicPackage.isSign`          | `boolean`  | 否   | -                            |
| `data.musicPackage.isSignDeduct`    | `boolean`  | 否   | -                            |
| `data.musicPackage.isSignIap`       | `boolean`  | 否   | -                            |
| `data.musicPackage.isSignIapDeduct` | `boolean`  | 否   | -                            |
| `data.musicPackage.vipCode`         | `number`   | 否   | -                            |
| `data.musicPackage.vipLevel`        | `number`   | 否   | -                            |
| `data.redVipAnnualCount`            | `number`   | 否   | -                            |
| `data.redVipLevel`                  | `number`   | 否   | -                            |
| `data.redVipLevelIcon`              | `string`   | 否   | -                            |
| `data.redplus`                      | `VipRight` | 否   | -                            |
| `data.redplus.dynamicIconUrl`       | `string`   | 否   | 资源访问链接                 |
| `data.redplus.expireTime`           | `number`   | 否   | 时间戳                       |
| `data.redplus.iconUrl`              | `string`   | 否   | 资源访问链接                 |
| `data.redplus.isSign`               | `boolean`  | 否   | -                            |
| `data.redplus.isSignDeduct`         | `boolean`  | 否   | -                            |
| `data.redplus.isSignIap`            | `boolean`  | 否   | -                            |
| `data.redplus.isSignIapDeduct`      | `boolean`  | 否   | -                            |
| `data.redplus.vipCode`              | `number`   | 否   | -                            |
| `data.redplus.vipLevel`             | `number`   | 否   | -                            |
| `message`                           | `string`   | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
