---
title: '曲风详情'
description: '调用此接口可以获取该曲风的描述信息'
---

# 曲风详情

调用此接口可以获取该曲风的描述信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/style/detail`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `style_detail`                                     |
| SDK 函数   | `styleDetail`（`hana-music-api/api/style_detail`） |
| 返回体类型 | `StyleDetailBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { styleDetail } from 'hana-music-api';

const result = await styleDetail({
  tagId: '1000',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/style/detail' \
  --data-urlencode 'tagId=1000'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明    |
| ------- | ------------------ | ---- | ------ | ------- |
| `tagId` | `number \| string` | 是   | -      | 曲风 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StyleDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/style_detail`、`hana-music-api/schemas/style_detail` 导入运行时校验器）。

```ts
type FavouriteSong = {
  favouriteSong?: LooseSong | null;
  markHeart?: number | null;
};

type ReviewEntry = {
  coverType?: number | null;
  text?: string | null;
  textType?: number | null;
};

type ProfessionalReviews = {
  pattern?: Record<string, ReviewEntry> | null;
  templateContent?: string | null;
};

type TagPortrait = {
  dataTip?: string | null;
  pattern?: Record<string, ReviewEntry> | null;
  templateContent?: string | null;
};

type StyleDetail = {
  tagId: number;
  artistNum?: string | null;
  colorDeep?: string | null;
  colorShallow?: string | null;
  cover?: Array<string> | null;
  desc?: string | null;
  enName?: string | null;
  favouriteSong?: FavouriteSong | null;
  level?: number | null;
  name?: string | null;
  parentNames?: string | null;
  professionalReviews?: ProfessionalReviews | null;
  songNum?: string | null;
  tabs?: Array<string> | null;
  tagPortrait?: TagPortrait | null;
};

type StyleDetailBody = {
  code: 200;
  data?: StyleDetail | null;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段   | 类型          | 必填 | 说明                         |
| ------ | ------------- | ---- | ---------------------------- |
| `code` | `200`         | 是   | 业务状态码（`200` 表示成功） |
| `data` | `StyleDetail` | 可空 | 接口返回的数据主体           |

<!-- api-doc:response:end -->
