---
title: '电台 - 节目详情'
description: '调用此接口传入电台节目 id，可获得电台节目详情'
---

# 电台 - 节目详情

调用此接口传入电台节目 id，可获得电台节目详情

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/dj/program/detail`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `dj_program_detail`                                         |
| SDK 函数   | `djProgramDetail`（`hana-music-api/api/dj_program_detail`） |
| 返回体类型 | `DjProgramDetailBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djProgramDetail } from 'hana-music-api';

const result = await djProgramDetail({
  id: '1367665101',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/program/detail' \
  --data-urlencode 'id=1367665101'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明           |
| ---- | ------------------ | ---- | ------ | -------------- |
| `id` | `number \| string` | 是   | -      | 电台节目 的 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjProgramDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_program_detail`、`hana-music-api/schemas/dj_program_detail` 导入运行时校验器）。

```ts
type DjProgramDetailBody = {
  code: 200;
  program: DjProgram;
};
```

- **公共类型**：[DjProgram](/api/shared-types#djprogram)

| 字段      | 类型                                     | 必填 | 说明                         |
| --------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`    | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `program` | [DjProgram](/api/shared-types#djprogram) | 是   | 电台节目详情                 |

<!-- api-doc:response:end -->
