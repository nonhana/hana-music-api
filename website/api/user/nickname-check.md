---
title: '重复昵称检测'
description: '调用此接口 ，可检测昵称是否重复，并提供备用昵称'
---

# 重复昵称检测

调用此接口 ，可检测昵称是否重复，并提供备用昵称

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/nickname/check`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `nickname_check`                                       |
| SDK 函数   | `nicknameCheck`（`hana-music-api/api/nickname_check`） |
| 返回体类型 | `NicknameCheckBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { nicknameCheck } from 'hana-music-api';

const result = await nicknameCheck({
  nickname: 'binaryify',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/nickname/check' \
  --data-urlencode 'nickname=binaryify'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明 |
| ---------- | -------- | ---- | ------ | ---- |
| `nickname` | `string` | 是   | -      | 昵称 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`NicknameCheckBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/nickname_check`、`hana-music-api/schemas/nickname_check` 导入运行时校验器）。

```ts
type NicknameCheckBody = {
  code: 200;
  duplicated: boolean;
  candidateNicknames?: Array<string> | null;
  nickname?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                 | 类型            | 必填 | 说明                                       |
| -------------------- | --------------- | ---- | ------------------------------------------ |
| `code`               | `200`           | 是   | 业务状态码（`200` 表示成功）               |
| `duplicated`         | `boolean`       | 是   | 昵称是否已被占用                           |
| `candidateNicknames` | `Array<string>` | 可空 | 推荐的可用替代昵称列表（仅昵称重复时出现） |
| `nickname`           | `string`        | 否   | 用户昵称                                   |

<!-- api-doc:response:end -->
