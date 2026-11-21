---
title: '乐谱列表'
description: '调用此接口可以获取歌曲的乐谱列表'
---

# 乐谱列表

调用此接口可以获取歌曲的乐谱列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/sheet/list`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `sheet_list`                                   |
| SDK 函数   | `sheetList`（`hana-music-api/api/sheet_list`） |
| 返回体类型 | `SheetListBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { sheetList } from 'hana-music-api';

const result = await sheetList({
  id: '1815684465',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/sheet/list' \
  --data-urlencode 'id=1815684465'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                       |
| ---- | ------------------ | ---- | ------ | -------------------------- |
| `ab` | `string`           | 否   | `b`    | A/B 实验分流参数，默认 `b` |
| `id` | `number \| string` | 是   | -      | 歌曲 ID                    |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SheetListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/sheet_list`、`hana-music-api/schemas/sheet_list` 导入运行时校验器）。

```ts
type Instrument = {
  code?: number | null;
  icon?: string | null;
  name?: string | null;
};

type Sheet = {
  id: number;
  bpm?: number | null;
  chordName?: string | null;
  commentNum?: number | null;
  coverImageUrl?: string | null;
  difficulty?: string | null;
  musicKey?: string | null;
  name?: string | null;
  playVersion?: string | null;
  sheetPackageId?: number | null;
  source?: number | null;
  sourceDesc?: string | null;
  totalPageSize?: number | null;
  type?: Array<Instrument> | null;
};

type SheetListData = {
  errorCode?: number | null;
  findSheet?: number | null;
  musicSheetSimpleInfoVOS?: Array<Sheet> | null;
  sheetInstrumentTypeVOList?: Array<Instrument> | null;
  uploadSheet?: number | null;
};

type SheetListBody = {
  code: 200;
  data: SheetListData;
  message?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                    | 类型                | 必填 | 说明                         |
| --------------------------------------- | ------------------- | ---- | ---------------------------- |
| `code`                                  | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `data`                                  | `SheetListData`     | 是   | 接口返回的数据主体           |
| `data.errorCode`                        | `number`            | 否   | -                            |
| `data.findSheet`                        | `number`            | 否   | -                            |
| `data.musicSheetSimpleInfoVOS`          | `Array<Sheet>`      | 可空 | -                            |
| `data.sheetInstrumentTypeVOList`        | `Array<Instrument>` | 可空 | -                            |
| `data.sheetInstrumentTypeVOList[].code` | `number`            | 否   | 业务状态码（`200` 表示成功） |
| `data.sheetInstrumentTypeVOList[].icon` | `string`            | 否   | -                            |
| `data.sheetInstrumentTypeVOList[].name` | `string`            | 否   | 名称                         |
| `data.uploadSheet`                      | `number`            | 否   | -                            |
| `message`                               | `string`            | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
