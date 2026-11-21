---
title: '获取专辑歌曲的音质'
description: '调用后可获取专辑歌曲的音质'
---

# 获取专辑歌曲的音质

调用后可获取专辑歌曲的音质

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/album/privilege`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 否                                                       |
| 对应模块   | `album_privilege`                                        |
| SDK 函数   | `albumPrivilege`（`hana-music-api/api/album_privilege`） |
| 返回体类型 | `AlbumPrivilegeBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumPrivilege } from 'hana-music-api';

const result = await albumPrivilege({
  id: '168223858',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/privilege' \
  --data-urlencode 'id=168223858'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 专辑 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumPrivilegeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_privilege`、`hana-music-api/schemas/album_privilege` 导入运行时校验器）。

```ts
type AlbumPrivilegeBody = {
  code: 200;
  data: Array<SongPrivilege>;
};
```

- **公共类型**：[SongPrivilege](/api/shared-types#songprivilege)

| 字段   | 类型                                                      | 必填 | 说明                         |
| ------ | --------------------------------------------------------- | ---- | ---------------------------- |
| `code` | `200`                                                     | 是   | 业务状态码（`200` 表示成功） |
| `data` | Array\<[SongPrivilege](/api/shared-types#songprivilege)\> | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
