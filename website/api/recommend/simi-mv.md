---
title: '相似 mv'
description: '调用此接口，传入 `mvid` 可获取相似 mv'
---

# 相似 mv

调用此接口，传入 `mvid` 可获取相似 mv

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                       |
| ---------- | ---------------------------------------- |
| 接口地址   | `/simi/mv`                               |
| 请求方式   | `GET` / `POST`                           |
| 需要登录   | 否                                       |
| 对应模块   | `simi_mv`                                |
| SDK 函数   | `simiMv`（`hana-music-api/api/simi_mv`） |
| 返回体类型 | `SimiMvBody`（已建模返回体）             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { simiMv } from 'hana-music-api';

const result = await simiMv({
  mvid: '5436712',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/simi/mv' \
  --data-urlencode 'mvid=5436712'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明  |
| ------ | ------------------ | ---- | ------ | ----- |
| `mvid` | `number \| string` | 是   | -      | mv id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SimiMvBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/simi_mv`、`hana-music-api/schemas/simi_mv` 导入运行时校验器）。

```ts
type SimiMv = Omit<MvSummary, 'alg'> & {
  alg?: string | null;
};

type SimiMvBody = {
  code: 200;
  mvs: Array<SimiMv>;
};
```

- **公共类型**：[MvSummary](/api/shared-types#mvsummary)

| 字段        | 类型            | 必填 | 说明                         |
| ----------- | --------------- | ---- | ---------------------------- |
| `code`      | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `mvs`       | `Array<SimiMv>` | 是   | MV 列表                      |
| `mvs[].alg` | `string`        | 否   | 推荐算法标识                 |

<!-- api-doc:response:end -->
