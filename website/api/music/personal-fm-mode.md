---
title: '私人 FM 模式选择'
description: '调用此接口返回私人 FM 内容，并可以选择模式'
---

# 私人 FM 模式选择

调用此接口返回私人 FM 内容，并可以选择模式

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                        |
| ---------- | --------------------------------------------------------- |
| 接口地址   | `/personal/fm/mode`                                       |
| 请求方式   | `GET` / `POST`                                            |
| 需要登录   | 否                                                        |
| 对应模块   | `personal_fm_mode`                                        |
| SDK 函数   | `personalFmMode`（`hana-music-api/api/personal_fm_mode`） |
| 返回体类型 | `PersonalFmModeBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalFmMode } from 'hana-music-api';

const result = await personalFmMode({
  mode: 'aidj',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/personal/fm/mode' \
  --data-urlencode 'mode=aidj'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型                                                             | 必填 | 默认值 | 说明                                                        |
| --------- | ---------------------------------------------------------------- | ---- | ------ | ----------------------------------------------------------- |
| `mode`    | `'aidj' \| 'DEFAULT' \| 'FAMILIAR' \| 'EXPLORE' \| 'SCENE_RCMD'` | 是   | -      | 模式 (aidj，DEFAULT，FAMILIAR，EXPLORE，SCENE_RCMD)         |
| `submode` | `string`                                                         | 否   | -      | 当 mode 为 SCENE_RCMD 是可为 ( EXERCISE，FOCUS，NIGHT_EMO ) |
| `limit`   | `number`                                                         | 否   | `3`    | 返回歌曲数量                                                |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalFmModeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personal_fm_mode`、`hana-music-api/schemas/personal_fm_mode` 导入运行时校验器）。

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

type FmRecReason = {
  fmRecReason?: string | null;
};

type PersonalFmModeBody = {
  code: 200;
  data: Array<FmSong>;
  extTransMap?: Record<string, FmRecReason> | null;
  popAdjust?: boolean | null;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[ProgramMainSong](/api/shared-types#programmainsong)

| 字段          | 类型                          | 必填 | 说明                         |
| ------------- | ----------------------------- | ---- | ---------------------------- |
| `code`        | `200`                         | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `Array<FmSong>`               | 是   | 接口返回的数据主体           |
| `data[].id`   | `number`                      | 是   | 记录 ID                      |
| `extTransMap` | `Record<string, FmRecReason>` | 否   | -                            |
| `popAdjust`   | `boolean`                     | 否   | -                            |

<!-- api-doc:response:end -->
