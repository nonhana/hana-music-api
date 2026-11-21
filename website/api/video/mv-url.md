---
title: 'mv 地址'
description: '调用此接口，传入 mv id，可获取 mv 播放地址'
---

# mv 地址

调用此接口，传入 mv id，可获取 mv 播放地址

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                     |
| ---------- | -------------------------------------- |
| 接口地址   | `/mv/url`                              |
| 请求方式   | `GET` / `POST`                         |
| 需要登录   | 否                                     |
| 对应模块   | `mv_url`                               |
| SDK 函数   | `mvUrl`（`hana-music-api/api/mv_url`） |
| 返回体类型 | `MvUrlBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvUrl } from 'hana-music-api';

const result = await mvUrl({
  id: '5436712',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/url' \
  --data-urlencode 'id=5436712'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                                                    |
| ---- | ------------------ | ---- | ------ | ------------------------------------------------------- |
| `id` | `number \| string` | 是   | -      | mv id                                                   |
| `r`  | `number`           | 否   | `1080` | 分辨率，默认 1080，可从 `/mv/detail` 接口获取分辨率列表 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvUrlBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_url`、`hana-music-api/schemas/mv_url` 导入运行时校验器）。

```ts
type MvUrl = {
  code: number;
  expi?: number | null;
  fee?: number | null;
  id: number;
  md5?: string | null;
  msg?: string | null;
  mvFee?: number | null;
  r?: number | null;
  size?: number | null;
  st?: number | null;
  url: string | null;
};

type MvUrlBody = {
  code: 200;
  data: MvUrl;
};
```

| 字段         | 类型             | 必填 | 说明                         |
| ------------ | ---------------- | ---- | ---------------------------- |
| `code`       | `200`            | 是   | 业务状态码（`200` 表示成功） |
| `data`       | `MvUrl`          | 是   | 接口返回的数据主体           |
| `data.code`  | `number`         | 是   | 业务状态码（`200` 表示成功） |
| `data.expi`  | `number`         | 否   | -                            |
| `data.fee`   | `number`         | 否   | -                            |
| `data.id`    | `number`         | 是   | 记录 ID                      |
| `data.md5`   | `string`         | 否   | -                            |
| `data.msg`   | `string`         | 否   | 提示信息                     |
| `data.mvFee` | `number`         | 否   | -                            |
| `data.r`     | `number`         | 否   | -                            |
| `data.size`  | `number`         | 否   | -                            |
| `data.st`    | `number`         | 否   | -                            |
| `data.url`   | `string \| null` | 是   | 资源访问地址                 |

<!-- api-doc:response:end -->
