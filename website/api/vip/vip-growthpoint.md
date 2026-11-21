---
title: 'vip 成长值'
description: '登录后调用此接口，可获取当前会员成长值'
---

# vip 成长值

登录后调用此接口，可获取当前会员成长值

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/vip/growthpoint`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `vip_growthpoint`                                        |
| SDK 函数   | `vipGrowthpoint`（`hana-music-api/api/vip_growthpoint`） |
| 返回体类型 | `VipGrowthpointBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipGrowthpoint } from 'hana-music-api';

const result = await vipGrowthpoint({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/vip/growthpoint' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VipGrowthpointBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/vip_growthpoint`、`hana-music-api/schemas/vip_growthpoint` 导入运行时校验器）。

```ts
type LevelCard = {
  accountPageIconImgUrl?: string | null;
  backgroundImageUrl?: string | null;
  blurryBackgroundImageUrl?: string | null;
  flashIconImgUrl?: string | null;
  level?: number | null;
  levelBackgroundCardExpireImageUrl?: string | null;
  levelBackgroundCardImageUrl?: string | null;
  levelMarkExpireImageUrl?: string | null;
  levelMarkImageUrl?: string | null;
  levelName?: string | null;
  newUpgradeFireworksImageUrl?: string | null;
  obtainLimitType?: number | null;
  privilegeIconUrl?: string | null;
  privilegeName?: string | null;
  privilegeSubTitle?: string | null;
  redVipBuckleImageUrl?: string | null;
  redVipExpireBuckleImageUrl?: string | null;
  redVipExpireImageUrl?: string | null;
  redVipExpireWholeImageUrl?: string | null;
  redVipImageUrl?: string | null;
  redVipWholeImageUrl?: string | null;
  resourceId?: number | null;
  rightId?: number | null;
  upgradeFireworksImageUrl?: string | null;
  vipGiftRightBarImageUrl?: string | null;
  vipLevelPageCardImgUrl?: string | null;
  vipLevelPageExpireCardImgUrl?: string | null;
};

type UserLevel = {
  userId: number;
  growthPoint: number;
  expireTime?: number | null;
  extJson?: string | null;
  latestVipStatus?: number | null;
  latestVipType?: number | null;
  level?: number | null;
  levelName?: string | null;
  maxLevel?: boolean | null;
  normal?: boolean | null;
  vipType?: number | null;
  yesterdayPoint?: number | null;
};

type VipGrowthpointBody = {
  code: 200;
  data: {
    levelCard?: LevelCard | null;
    userLevel: UserLevel;
  };
  message?: string | null;
};
```

| 字段                             | 类型        | 必填 | 说明                         |
| -------------------------------- | ----------- | ---- | ---------------------------- |
| `code`                           | `200`       | 是   | 业务状态码（`200` 表示成功） |
| `data`                           | `object`    | 是   | 接口返回的数据主体           |
| `data.levelCard`                 | `LevelCard` | 否   | -                            |
| `data.userLevel`                 | `UserLevel` | 是   | -                            |
| `data.userLevel.userId`          | `number`    | 是   | 用户 ID                      |
| `data.userLevel.growthPoint`     | `number`    | 是   | 当前成长值                   |
| `data.userLevel.expireTime`      | `number`    | 否   | 时间戳                       |
| `data.userLevel.extJson`         | `string`    | 否   | -                            |
| `data.userLevel.latestVipStatus` | `number`    | 否   | -                            |
| `data.userLevel.latestVipType`   | `number`    | 否   | -                            |
| `data.userLevel.level`           | `number`    | 否   | 当前等级                     |
| `data.userLevel.levelName`       | `string`    | 否   | -                            |
| `data.userLevel.maxLevel`        | `boolean`   | 否   | -                            |
| `data.userLevel.normal`          | `boolean`   | 否   | -                            |
| `data.userLevel.vipType`         | `number`    | 否   | 会员类型标识                 |
| `data.userLevel.yesterdayPoint`  | `number`    | 否   | -                            |
| `message`                        | `string`    | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
