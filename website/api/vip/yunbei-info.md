---
title: '云贝账户信息'
description: '无需登录即可调用；登录后返回当前账号的云贝账户信息（账户云贝数）'
---

# 云贝账户信息

无需登录即可调用；登录后返回当前账号的云贝账户信息（账户云贝数）

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/yunbei/info`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `yunbei_info`                                    |
| SDK 函数   | `yunbeiInfo`（`hana-music-api/api/yunbei_info`） |
| 返回体类型 | `YunbeiInfoBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbeiInfo } from 'hana-music-api';

const result = await yunbeiInfo();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/yunbei/info'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`YunbeiInfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/yunbei_info`、`hana-music-api/schemas/yunbei_info` 导入运行时校验器）。

```ts
type UserPoint = {
  userId: number;
  balance: number;
  blockBalance?: number | null;
  status?: number | null;
  updateTime?: number | null;
  version?: number | null;
};

type TicketConfig = {
  content?: string | null;
  picId?: string | null;
  picUrl?: string | null;
};

type YunbeiInfoBody = {
  code: 200;
  userPoint: UserPoint;
  backupExpireTime?: number | null;
  expiretime?: number | null;
  level?: number | null;
  mobileSign?: boolean | null;
  pcSign?: boolean | null;
  pubwords?: string | null;
  storeTitle?: string | null;
  ticketConfig?: TicketConfig | null;
  viptype?: number | null;
};
```

| 字段                     | 类型           | 必填 | 说明                         |
| ------------------------ | -------------- | ---- | ---------------------------- |
| `code`                   | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `userPoint`              | `UserPoint`    | 是   | 当前账号云贝余额与积分信息   |
| `userPoint.userId`       | `number`       | 是   | 用户 ID                      |
| `userPoint.balance`      | `number`       | 是   | 当前云贝余额                 |
| `userPoint.blockBalance` | `number`       | 否   | -                            |
| `userPoint.status`       | `number`       | 否   | -                            |
| `userPoint.updateTime`   | `number`       | 否   | 时间戳                       |
| `userPoint.version`      | `number`       | 否   | 当前服务版本号               |
| `backupExpireTime`       | `number`       | 否   | 时间戳                       |
| `expiretime`             | `number`       | 否   | 时间戳                       |
| `level`                  | `number`       | 否   | 当前等级                     |
| `mobileSign`             | `boolean`      | 否   | -                            |
| `pcSign`                 | `boolean`      | 否   | -                            |
| `pubwords`               | `string`       | 否   | -                            |
| `storeTitle`             | `string`       | 否   | -                            |
| `ticketConfig`           | `TicketConfig` | 否   | -                            |
| `ticketConfig.content`   | `string`       | 否   | 正文内容                     |
| `ticketConfig.picId`     | `string`       | 否   | pic ID                       |
| `ticketConfig.picUrl`    | `string`       | 否   | 资源访问链接                 |
| `viptype`                | `number`       | 否   | -                            |

<!-- api-doc:response:end -->
