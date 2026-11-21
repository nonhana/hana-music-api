---
title: '乐签信息'
description: '调用此接口，可获取乐签信息'
---

# 乐签信息

调用此接口，可获取乐签信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/sign/happy/info`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 是                                                      |
| 对应模块   | `sign_happy_info`                                       |
| SDK 函数   | `signHappyInfo`（`hana-music-api/api/sign_happy_info`） |
| 返回体类型 | `SignHappyInfoBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { signHappyInfo } from 'hana-music-api';

const result = await signHappyInfo({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/sign/happy/info' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SignHappyInfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/sign_happy_info`、`hana-music-api/schemas/sign_happy_info` 导入运行时校验器）。

```ts
type HotComment = {
  authorName?: string | null;
  content?: string | null;
};

type SignHappyInfo = {
  id: number;
  author?: string | null;
  backColor?: string | null;
  currentUserName?: string | null;
  endTime?: number | null;
  hotComments?: Array<HotComment> | null;
  jumpUrl?: string | null;
  mainText?: string | null;
  newPicUrl?: string | null;
  newSharePicUrl?: string | null;
  picUrl?: string | null;
  qrCodeUrl?: string | null;
  qrCodeWithLogoUrl?: string | null;
  resourceAuthor?: string | null;
  resourceCover?: string | null;
  resourceId?: number | null;
  resourceName?: string | null;
  resourceType?: number | null;
  resourceUrl?: string | null;
  sharePicUrl?: string | null;
  startTime?: number | null;
  status?: number | null;
  type?: number | null;
  videoHeight?: number | null;
  videoWidth?: number | null;
};

type SignHappyInfoBody = {
  code: 200;
  data: {
    info: SignHappyInfo;
  };
  message?: string | null;
};
```

| 字段        | 类型            | 必填 | 说明                         |
| ----------- | --------------- | ---- | ---------------------------- |
| `code`      | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`      | `object`        | 是   | 接口返回的数据主体           |
| `data.info` | `SignHappyInfo` | 是   | -                            |
| `message`   | `string`        | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
