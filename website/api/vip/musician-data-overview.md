---
title: '音乐人数据概况'
description: '音乐人登录后调用此接口，可获取统计数据概况'
---

# 音乐人数据概况

音乐人登录后调用此接口，可获取统计数据概况

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                    |
| ---------- | --------------------------------------------------------------------- |
| 接口地址   | `/musician/data/overview`                                             |
| 请求方式   | `GET` / `POST`                                                        |
| 需要登录   | 是                                                                    |
| 对应模块   | `musician_data_overview`                                              |
| SDK 函数   | `musicianDataOverview`（`hana-music-api/api/musician_data_overview`） |
| 返回体类型 | `MusicianDataOverviewBody`（已建模返回体）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicianDataOverview } from 'hana-music-api';

const result = await musicianDataOverview(
  {},
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/musician/data/overview' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MusicianDataOverviewBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/musician_data_overview`、`hana-music-api/schemas/musician_data_overview` 导入运行时校验器）。

```ts
type OverviewData = {
  availableExtractIncomeTotal?: string | null;
  musicianLevelScore?: number | null;
  productionTotal?: number | null;
  totalFansCount?: number | null;
};

type MusicianDataOverviewBody = {
  code: 200;
  data: OverviewData;
  message?: string | null;
};
```

| 字段                               | 类型           | 必填 | 说明                         |
| ---------------------------------- | -------------- | ---- | ---------------------------- |
| `code`                             | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `data`                             | `OverviewData` | 是   | 接口返回的数据主体           |
| `data.availableExtractIncomeTotal` | `string`       | 否   | -                            |
| `data.musicianLevelScore`          | `number`       | 否   | -                            |
| `data.productionTotal`             | `number`       | 否   | -                            |
| `data.totalFansCount`              | `number`       | 否   | -                            |
| `message`                          | `string`       | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
