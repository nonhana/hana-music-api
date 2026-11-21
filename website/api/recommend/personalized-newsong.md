---
title: '推荐新音乐'
description: '调用此接口，可获取推荐新音乐'
---

# 推荐新音乐

调用此接口，可获取推荐新音乐

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                 |
| ---------- | ------------------------------------------------------------------ |
| 接口地址   | `/personalized/newsong`                                            |
| 请求方式   | `GET` / `POST`                                                     |
| 需要登录   | 否                                                                 |
| 对应模块   | `personalized_newsong`                                             |
| SDK 函数   | `personalizedNewsong`（`hana-music-api/api/personalized_newsong`） |
| 返回体类型 | `PersonalizedNewsongBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalizedNewsong } from 'hana-music-api';

const result = await personalizedNewsong({
  areaId: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/personalized/newsong' \
  --data-urlencode 'areaId=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                |
| -------- | -------- | ---- | ------ | ----------------------------------- |
| `areaId` | `number` | 否   | `0`    | 地区 ID（用于筛选新歌地区）         |
| `limit`  | `number` | 否   | `10`   | 取出数量，默认为 10 (不支持 offset) |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalizedNewsongBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personalized_newsong`、`hana-music-api/schemas/personalized_newsong` 导入运行时校验器）。

```ts
type NewsongAlbum = Omit<SimpleAlbum, 'transName'> & {
  transName?: string | null;
};

type NewsongSong = Omit<
  ProgramMainSong,
  | 'album'
  | 'alias'
  | 'exclusive'
  | 'hrMusic'
  | 'privilege'
  | 'sqMusic'
  | 'transName'
  | 'transNames'
> & {
  album?: NewsongAlbum | null;
  alias?: Array<string> | null;
  exclusive?: boolean | null;
  hrMusic?: ProgramQuality | null;
  privilege?: LooseSongPrivilege | null;
  sqMusic?: ProgramQuality | null;
  transName?: string | null;
  transNames?: Array<string> | null;
};

type NewsongItem = {
  id: number;
  alg?: string | null;
  canDislike?: boolean | null;
  name?: string | null;
  picUrl?: string | null;
  song?: NewsongSong | null;
  type?: number | null;
};

type PersonalizedNewsongBody = {
  code: 200;
  result: Array<NewsongItem>;
  category?: number | null;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[ProgramMainSong](/api/shared-types#programmainsong)、[ProgramQuality](/api/shared-types#programquality)、[SimpleAlbum](/api/shared-types#simplealbum)

| 字段                  | 类型                 | 必填 | 说明                                                        |
| --------------------- | -------------------- | ---- | ----------------------------------------------------------- |
| `code`                | `200`                | 是   | 业务状态码（`200` 表示成功）                                |
| `result`              | `Array<NewsongItem>` | 是   | 接口返回的结果主体                                          |
| `result[].id`         | `number`             | 是   | 记录 ID                                                     |
| `result[].alg`        | `string`             | 否   | 推荐算法标识                                                |
| `result[].canDislike` | `boolean`            | 否   | -                                                           |
| `result[].name`       | `string`             | 否   | 名称                                                        |
| `result[].picUrl`     | `string`             | 否   | 资源访问链接                                                |
| `result[].song`       | `NewsongSong`        | 否   | 继承自 [ProgramMainSong](/api/shared-types#programmainsong) |
| `result[].type`       | `number`             | 否   | -                                                           |
| `category`            | `number`             | 否   | -                                                           |
| `trp`                 | `object`             | 否   | -                                                           |
| `trp.rules`           | `Array<string>`      | 否   | -                                                           |

<!-- api-doc:response:end -->
