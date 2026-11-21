---
title: '用户电台'
description: '调用此接口，传入用户 id 可获取用户创建的电台'
---

# 用户电台

调用此接口，传入用户 id 可获取用户创建的电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/user/audio`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `user_audio`                                   |
| SDK 函数   | `userAudio`（`hana-music-api/api/user_audio`） |
| 返回体类型 | `UserAudioBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userAudio } from 'hana-music-api';

const result = await userAudio({
  uid: '32953014',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/audio' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明    |
| ----- | ------------------ | ---- | ------ | ------- |
| `uid` | `number \| string` | 是   | -      | 用户 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserAudioBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_audio`、`hana-music-api/schemas/user_audio` 导入运行时校验器）。

```ts
type UserAudioRadio = {
  id: number;
  buyed?: boolean | null;
  category?: string | null;
  categoryId?: number | null;
  createTime?: number | null;
  desc?: string | null;
  dj?: PlaylistUser | null;
  dynamic?: boolean | null;
  feeScope?: number | null;
  finished?: boolean | null;
  intervenePicId?: number | null;
  intervenePicUrl?: string | null;
  lastProgramCreateTime?: number | null;
  lastProgramId?: number | null;
  lastProgramName?: string | null;
  name?: string | null;
  originalPrice?: number | null;
  picId?: number | null;
  picUrl?: string | null;
  playCount?: number | null;
  price?: number | null;
  privacy?: boolean | null;
  programCount?: number | null;
  purchaseCount?: number | null;
  radioFeeType?: number | null;
  rcmdtext?: string | null;
  replaceRadioId?: number | null;
  secondCategory?: string | null;
  subCount?: number | null;
  taskId?: number | null;
  underShelf?: boolean | null;
};

type UserAudioBody = {
  code: 200;
  djRadios: Array<UserAudioRadio>;
  count?: number | null;
  hasMore?: boolean | null;
  subCount?: number | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段       | 类型                    | 必填 | 说明                         |
| ---------- | ----------------------- | ---- | ---------------------------- |
| `code`     | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `djRadios` | `Array<UserAudioRadio>` | 是   | 电台列表                     |
| `count`    | `number`                | 否   | 条目总数                     |
| `hasMore`  | `boolean`               | 否   | 是否还有更多数据             |
| `subCount` | `number`                | 否   | -                            |

<!-- api-doc:response:end -->
