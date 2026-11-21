---
title: '乐谱内容'
description: '调用此接口获取乐谱的内容'
---

# 乐谱内容

调用此接口获取乐谱的内容

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/sheet/preview`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `sheet_preview`                                      |
| SDK 函数   | `sheetPreview`（`hana-music-api/api/sheet_preview`） |
| 返回体类型 | `SheetPreviewBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { sheetPreview } from 'hana-music-api';

const result = await sheetPreview({
  id: '143190',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/sheet/preview' \
  --data-urlencode 'id=143190'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明        |
| ---- | ------------------ | ---- | ------ | ----------- |
| `id` | `number \| string` | 是   | -      | **乐谱** ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SheetPreviewBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/sheet_preview`、`hana-music-api/schemas/sheet_preview` 导入运行时校验器）。

```ts
type SheetPage = {
  id: number;
  md5?: string | null;
  pageNumber?: number | null;
  sheetId?: number | null;
  size?: number | null;
  url: string;
};

type SheetPreviewBody = {
  code: 200;
  data: Array<SheetPage>;
  message?: string | null;
};
```

| 字段                | 类型               | 必填 | 说明                         |
| ------------------- | ------------------ | ---- | ---------------------------- |
| `code`              | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`              | `Array<SheetPage>` | 是   | 接口返回的数据主体           |
| `data[].id`         | `number`           | 是   | 记录 ID                      |
| `data[].md5`        | `string`           | 否   | -                            |
| `data[].pageNumber` | `number`           | 否   | -                            |
| `data[].sheetId`    | `number`           | 否   | sheet ID                     |
| `data[].size`       | `number`           | 否   | -                            |
| `data[].url`        | `string`           | 是   | 资源访问地址                 |
| `message`           | `string`           | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
