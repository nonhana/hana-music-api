---
title: '内部版本接口'
description: '调用此接口，可获得内部版本号(从package.json读取)'
---

# 内部版本接口

调用此接口，可获得内部版本号(从package.json读取)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/inner/version`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `inner_version`                                      |
| SDK 函数   | `innerVersion`（`hana-music-api/api/inner_version`） |
| 返回体类型 | `InnerVersionBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { innerVersion } from 'hana-music-api';

const result = await innerVersion();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/inner/version'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`InnerVersionBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/inner_version`、`hana-music-api/schemas/inner_version` 导入运行时校验器）。

```ts
type InnerVersionBody = {
  code: 200;
  data: {
    version: string;
  };
};
```

| 字段           | 类型     | 必填 | 说明                         |
| -------------- | -------- | ---- | ---------------------------- |
| `code`         | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `object` | 是   | 接口返回的数据主体           |
| `data.version` | `string` | 是   | 当前服务版本号               |

<!-- api-doc:response:end -->

## 注意事项

- **本地执行**：本接口在本地直接返回服务构建版本号，不向上游发送网络请求。
