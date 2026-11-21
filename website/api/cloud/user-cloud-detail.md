---
title: '云盘数据详情'
description: '登录后调用此接口，传入云盘歌曲 id，可获取云盘数据详情'
---

# 云盘数据详情

登录后调用此接口，传入云盘歌曲 id，可获取云盘数据详情

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/user/cloud/detail`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 是                                                          |
| 对应模块   | `user_cloud_detail`                                         |
| SDK 函数   | `userCloudDetail`（`hana-music-api/api/user_cloud_detail`） |
| 返回体类型 | `UserCloudDetailBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userCloudDetail } from 'hana-music-api';

const result = await userCloudDetail(
  {
    ids: [347230],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/cloud/detail' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明             |
| ----- | ------------------------- | ---- | ------ | ---------------- |
| `ids` | `Array<number \| string>` | 是   | -      | 云盘歌曲 ID 数组 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserCloudDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_cloud_detail`、`hana-music-api/schemas/user_cloud_detail` 导入运行时校验器）。

```ts
type CloudDetailEntry = {
  songId: number;
  addTime?: number | null;
  album?: string | null;
  artist?: string | null;
  bitrate?: number | null;
  cover?: number | null;
  coverId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  lyricId?: string | null;
  matchType?: string | null;
  pcId?: number | null;
  simpleSong?: LooseSong | null;
  songName?: string | null;
  version?: number | null;
};

type UserCloudDetailBody = {
  code: 200;
  data: Array<CloudDetailEntry>;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)

| 字段   | 类型                      | 必填 | 说明                         |
| ------ | ------------------------- | ---- | ---------------------------- |
| `code` | `200`                     | 是   | 业务状态码（`200` 表示成功） |
| `data` | `Array<CloudDetailEntry>` | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
