---
title: '搜索歌手'
description: '登录后调用此接口，使用此接口，传入歌手名关键字或者歌手id，可获取搜索到的歌手信息'
---

# 搜索歌手

登录后调用此接口，使用此接口，传入歌手名关键字或者歌手id，可获取搜索到的歌手信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/ugc/artist/search`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 是                                                          |
| 对应模块   | `ugc_artist_search`                                         |
| SDK 函数   | `ugcArtistSearch`（`hana-music-api/api/ugc_artist_search`） |
| 返回体类型 | `UgcArtistSearchBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcArtistSearch } from 'hana-music-api';

const result = await ugcArtistSearch(
  {
    keyword: 'sasakure',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/ugc/artist/search' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'keyword=sasakure'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型               | 必填 | 默认值 | 说明                    |
| --------- | ------------------ | ---- | ------ | ----------------------- |
| `keyword` | `number \| string` | 是   | -      | 关键字或歌手id          |
| `limit`   | `number`           | 否   | `40`   | 取出条目数量，默认为 40 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcArtistSearchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_artist_search`、`hana-music-api/schemas/ugc_artist_search` 导入运行时校验器）。

```ts
type SearchedArtist = {
  artistId: number;
  artistAvatarPicUrl?: string | null;
  artistName?: string | null;
};

type UgcArtistSearchBody = {
  code: 200;
  data: {
    list: Array<SearchedArtist>;
    totalCount?: number | null;
  };
  msg?: string | null;
};
```

| 字段                             | 类型                    | 必填 | 说明                         |
| -------------------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                           | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                           | `object`                | 是   | 接口返回的数据主体           |
| `data.list`                      | `Array<SearchedArtist>` | 是   | 结果条目列表                 |
| `data.list[].artistId`           | `number`                | 是   | 歌手 ID                      |
| `data.list[].artistAvatarPicUrl` | `string`                | 否   | 资源访问链接                 |
| `data.list[].artistName`         | `string`                | 否   | 歌手名称                     |
| `data.totalCount`                | `number`                | 否   | 评论或条目总数               |
| `msg`                            | `string`                | 否   | 提示信息                     |

<!-- api-doc:response:end -->
