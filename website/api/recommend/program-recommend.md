---
title: '推荐节目'
description: '调用此接口，可获取推荐电台'
---

# 推荐节目

调用此接口，可获取推荐电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| 接口地址   | `/program/recommend`                                         |
| 请求方式   | `GET` / `POST`                                               |
| 需要登录   | 否                                                           |
| 对应模块   | `program_recommend`                                          |
| SDK 函数   | `programRecommend`（`hana-music-api/api/program_recommend`） |
| 返回体类型 | `ProgramRecommendBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { programRecommend } from 'hana-music-api';

const result = await programRecommend({
  limit: 5,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/program/recommend' \
  --data-urlencode 'limit=5'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                        |
| -------- | -------- | ---- | ------ | --------------------------------------------------------------------------- |
| `type`   | `string` | 否   | -      | 节目分类过滤标识（如 `PUBLIC`）                                             |
| `limit`  | `number` | 否   | `10`   | 取出数量，默认为 10                                                         |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*10，其中 10 为 limit 的值，默认<br>为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ProgramRecommendBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/program_recommend`、`hana-music-api/schemas/program_recommend` 导入运行时校验器）。

```ts
type ProgramRecommendBody = {
  code: 200;
  programs: Array<DjProgram>;
  more?: boolean | null;
  name?: string | null;
};
```

- **公共类型**：[DjProgram](/api/shared-types#djprogram)

| 字段       | 类型                                              | 必填 | 说明                         |
| ---------- | ------------------------------------------------- | ---- | ---------------------------- |
| `code`     | `200`                                             | 是   | 业务状态码（`200` 表示成功） |
| `programs` | Array\<[DjProgram](/api/shared-types#djprogram)\> | 是   | 电台节目列表                 |
| `more`     | `boolean`                                         | 否   | 是否还有更多数据             |
| `name`     | `string`                                          | 否   | 名称                         |

<!-- api-doc:response:end -->
