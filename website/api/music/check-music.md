---
title: '音乐是否可用'
description: "调用此接口，传入歌曲 id，可获取音乐是否可用，返回 `{ success: true，message: 'ok' }` 或者 `{ success: false，message: '亲爱的，暂无版权' }`"
---

# 音乐是否可用

调用此接口，传入歌曲 id，可获取音乐是否可用，返回 `{ success: true，message: 'ok' }` 或者 `{ success: false，message: '亲爱的，暂无版权' }`

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/check/music`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `check_music`                                    |
| SDK 函数   | `checkMusic`（`hana-music-api/api/check_music`） |
| 返回体类型 | `CheckMusicBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { checkMusic } from 'hana-music-api';

const result = await checkMusic({
  id: '33894312',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/check/music' \
  --data-urlencode 'id=33894312'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值   | 说明                                                                                                        |
| ---- | ------------------ | ---- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `br` | `number`           | 否   | `999000` | 目标音频码率（bps），默认 `999000`                                                                          |
| `id` | `number \| string` | 是   | 999000   | 歌曲 id<br>**可选参数** : `br`: 码率，默认设置了 999000 即最大码率，如果要 320k 则可设置为 320000，其他类推 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CheckMusicBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/check_music`、`hana-music-api/schemas/check_music` 导入运行时校验器）。

```ts
type CheckMusicBody = {
  code: 200;
  success: boolean;
  message: string;
};
```

| 字段      | 类型      | 必填 | 说明                         |
| --------- | --------- | ---- | ---------------------------- |
| `code`    | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `success` | `boolean` | 是   | 操作是否成功                 |
| `message` | `string`  | 是   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **返回体说明**：SDK 会将上游校验结果整理为固定结构 `{ code, success, message }`返回。
