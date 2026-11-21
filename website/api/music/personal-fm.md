---
title: '私人 FM'
description: '私人 FM( 需要登录 )'
---

# 私人 FM

私人 FM( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/personal_fm`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `personal_fm`                                    |
| SDK 函数   | `personalFm`（`hana-music-api/api/personal_fm`） |
| 返回体类型 | `PersonalFmBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalFm } from 'hana-music-api';

const result = await personalFm({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/personal_fm' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalFmBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personal_fm`、`hana-music-api/schemas/personal_fm` 导入运行时校验器）。

```ts
type FmSong = Omit<
  ProgramMainSong,
  | 'id'
  | 'alg'
  | 'alias'
  | 'fmRecReason'
  | 'privilege'
  | 'reason'
  | 'reasonId'
  | 'transName'
  | 'transNames'
> & {
  id: number;
  alg?: string | null;
  alias?: Array<string> | null;
  fmRecReason?: string | null;
  privilege?: LooseSongPrivilege | null;
  reason?: string | null;
  reasonId?: string | null;
  transName?: string | null;
  transNames?: Array<string> | null;
};

type PersonalFmBody = {
  code: 200;
  data: Array<FmSong>;
  extTransMap?: Record<string, UnknownJson> | null;
  popAdjust?: boolean | null;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[ProgramMainSong](/api/shared-types#programmainsong)

| 字段          | 类型                          | 必填 | 说明                         |
| ------------- | ----------------------------- | ---- | ---------------------------- |
| `code`        | `200`                         | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `Array<FmSong>`               | 是   | 接口返回的数据主体           |
| `data[].id`   | `number`                      | 是   | 记录 ID                      |
| `extTransMap` | `Record<string, UnknownJson>` | 否   | -                            |
| `popAdjust`   | `boolean`                     | 否   | -                            |

<!-- api-doc:response:end -->
