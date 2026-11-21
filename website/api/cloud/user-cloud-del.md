---
title: '云盘歌曲删除'
description: '登录后调用此接口，可删除云盘歌曲'
---

# 云盘歌曲删除

登录后调用此接口，可删除云盘歌曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                    |
| ---------- | ----------------------------------------------------- |
| 接口地址   | `/user/cloud/del`                                     |
| 请求方式   | `GET` / `POST`                                        |
| 需要登录   | 是                                                    |
| 对应模块   | `user_cloud_del`                                      |
| SDK 函数   | `userCloudDel`（`hana-music-api/api/user_cloud_del`） |
| 返回体类型 | `UnknownJson`（未建模接口）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userCloudDel } from 'hana-music-api';

const result = await userCloudDel(
  {
    id: '123456',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/cloud/del' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=123456'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                        |
| ---- | ------------------ | ---- | ------ | --------------------------- |
| `id` | `number \| string` | 是   | -      | 歌曲 id，可多个，用逗号隔开 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
