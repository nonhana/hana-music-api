---
title: '用户贡献内容'
description: '登录后调用此接口，使用此接口，可获取当前登录用户贡献内容'
---

# 用户贡献内容

登录后调用此接口，使用此接口，可获取当前登录用户贡献内容

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/ugc/detail`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `ugc_detail`                                   |
| SDK 函数   | `ugcDetail`（`hana-music-api/api/ugc_detail`） |
| 返回体类型 | `UgcDetailBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcDetail } from 'hana-music-api';

const result = await ugcDetail(
  {
    auditStatus: -5,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/ugc/detail' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'auditStatus=-5'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型                                       | 必填 | 默认值       | 说明                                |
| ------------- | ------------------------------------------ | ---- | ------------ | ----------------------------------- |
| `auditStatus` | `-5 \| 0 \| 1 \| 4 \| 5`                   | 否   | ``           | 审核状态                            |
| `limit`       | `number`                                   | 否   | `10`         | 取出条目数量，默认为 10             |
| `offset`      | `number`                                   | 否   | `0`          | 偏移数量                            |
| `order`       | `'asc' \| 'desc'`                          | 否   | `desc`       | 排序，默认为降序 降序:desc 顺序:asc |
| `sortBy`      | `string`                                   | 否   | `createTime` | 排序字段，默认 `createTime`         |
| `type`        | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 101 \| 103` | 否   | `1`          | 内容种类                            |

| `type` | 内容种类                |
| ------ | ----------------------- |
| `1`    | 曲库纠错 - 歌手（默认） |
| `2`    | 曲库纠错 - 专辑         |
| `3`    | 曲库纠错 - 歌曲         |
| `4`    | 曲库纠错 - MV           |
| `5`    | 曲库纠错 - 歌词         |
| `6`    | 曲库纠错 - 翻译         |
| `101`  | 曲库补充 - 专辑         |
| `103`  | 曲库补充 - MV           |

| `auditStatus` | 审核状态     |
| ------------- | ------------ |
| `0`           | 待审核       |
| `-5`          | 未采纳       |
| `1`           | 审核中       |
| `4`           | 部分审核通过 |
| `5`           | 审核通过     |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_detail`、`hana-music-api/schemas/ugc_detail` 导入运行时校验器）。

```ts
type UgcDetailBody = {
  code: 200;
  data: {
    total?: number | null;
  };
  message?: string | null;
};
```

| 字段         | 类型     | 必填 | 说明                         |
| ------------ | -------- | ---- | ---------------------------- |
| `code`       | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`       | `object` | 是   | 接口返回的数据主体           |
| `data.total` | `number` | 否   | 总条目数                     |
| `message`    | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
