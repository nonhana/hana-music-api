---
title: '听歌足迹 - 年度听歌足迹'
description: '登录后调用此接口，获取年度听歌足迹'
---

# 听歌足迹 - 年度听歌足迹

登录后调用此接口，获取年度听歌足迹

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 接口地址   | `/listen/data/year/report`                                             |
| 请求方式   | `GET` / `POST`                                                         |
| 需要登录   | 是                                                                     |
| 对应模块   | `listen_data_year_report`                                              |
| SDK 函数   | `listenDataYearReport`（`hana-music-api/api/listen_data_year_report`） |
| 返回体类型 | `ListenDataYearReportBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listenDataYearReport } from 'hana-music-api';

const result = await listenDataYearReport(
  {},
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/listen/data/year/report' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListenDataYearReportBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listen_data_year_report`、`hana-music-api/schemas/listen_data_year_report` 导入运行时校验器）。

```ts
type YearItem = {
  playDuration?: number | null;
  playNum?: number | null;
  year: number;
};

type ListenDataYearReportBody = {
  code: 200;
  data: {
    displayYear?: number | null;
    yearItems: Array<YearItem>;
  };
  message?: string | null;
};
```

| 字段                            | 类型              | 必填 | 说明                         |
| ------------------------------- | ----------------- | ---- | ---------------------------- |
| `code`                          | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`                          | `object`          | 是   | 接口返回的数据主体           |
| `data.displayYear`              | `number`          | 否   | -                            |
| `data.yearItems`                | `Array<YearItem>` | 是   | -                            |
| `data.yearItems[].playDuration` | `number`          | 否   | -                            |
| `data.yearItems[].playNum`      | `number`          | 否   | -                            |
| `data.yearItems[].year`         | `number`          | 是   | -                            |
| `message`                       | `string`          | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
