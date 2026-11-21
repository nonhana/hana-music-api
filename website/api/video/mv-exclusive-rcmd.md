---
title: '网易出品 mv'
description: '调用此接口，可获取网易出品 mv'
---

# 网易出品 mv

调用此接口，可获取网易出品 mv

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/mv/exclusive/rcmd`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `mv_exclusive_rcmd`                                         |
| SDK 函数   | `mvExclusiveRcmd`（`hana-music-api/api/mv_exclusive_rcmd`） |
| 返回体类型 | `MvExclusiveRcmdBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvExclusiveRcmd } from 'hana-music-api';

const result = await mvExclusiveRcmd({
  limit: 10,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/exclusive/rcmd' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                        |
| -------- | -------- | ---- | ------ | --------------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `30`   | 取出数量，默认为 30                                                         |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认<br>为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvExclusiveRcmdBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_exclusive_rcmd`、`hana-music-api/schemas/mv_exclusive_rcmd` 导入运行时校验器）。

```ts
type MvExclusiveRcmdBody = {
  code: 200;
  data: Array<MvSummary>;
  more?: boolean | null;
};
```

- **公共类型**：[MvSummary](/api/shared-types#mvsummary)

| 字段   | 类型                                              | 必填 | 说明                         |
| ------ | ------------------------------------------------- | ---- | ---------------------------- |
| `code` | `200`                                             | 是   | 业务状态码（`200` 表示成功） |
| `data` | Array\<[MvSummary](/api/shared-types#mvsummary)\> | 是   | 接口返回的数据主体           |
| `more` | `boolean`                                         | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
