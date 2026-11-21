---
title: '账号云豆数'
description: '音乐人登录后调用此接口，可获取账号云豆数'
---

# 账号云豆数

音乐人登录后调用此接口，可获取账号云豆数

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/musician/cloudbean`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 是                                                             |
| 对应模块   | `musician_cloudbean`                                           |
| SDK 函数   | `musicianCloudbean`（`hana-music-api/api/musician_cloudbean`） |
| 返回体类型 | `MusicianCloudbeanBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicianCloudbean } from 'hana-music-api';

const result = await musicianCloudbean({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/musician/cloudbean' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MusicianCloudbeanBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/musician_cloudbean`、`hana-music-api/schemas/musician_cloudbean` 导入运行时校验器）。

```ts
type CloudbeanData = {
  artistId: number;
  cloudBean: number;
  maxCloudBean?: number | null;
  needPop?: boolean | null;
  signed?: boolean | null;
};

type MusicianCloudbeanBody = {
  code: 200;
  data: CloudbeanData;
  message?: string | null;
};
```

| 字段                | 类型            | 必填 | 说明                         |
| ------------------- | --------------- | ---- | ---------------------------- |
| `code`              | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`              | `CloudbeanData` | 是   | 接口返回的数据主体           |
| `data.artistId`     | `number`        | 是   | 歌手 ID                      |
| `data.cloudBean`    | `number`        | 是   | -                            |
| `data.maxCloudBean` | `number`        | 否   | -                            |
| `data.needPop`      | `boolean`       | 否   | -                            |
| `data.signed`       | `boolean`       | 否   | -                            |
| `message`           | `string`        | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
