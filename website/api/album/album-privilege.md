---
title: '获取专辑歌曲的音质'
description: '调用后可获取专辑歌曲的音质'
---

# 获取专辑歌曲的音质

> 调用后可获取专辑歌曲的音质

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/album/privilege` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `album_privilege`  |
| 文档分类 | 专辑               |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 专辑 id |

## HTTP 示例

```bash
GET /album/privilege?id=168223858
```

## 编程式调用

```ts
import { albumPrivilege } from 'hana-music-api';

const result = await albumPrivilege({
  id: '168223858',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data` 和每首歌的 `data[].id` 收紧，记录共用 `SongPrivilege`；权限里的 `dl`、`pl`、`payed`、`freeTrialPrivilege` 等其余字段宽松。登录后播放/下载权限和 `freeTrialPrivilege.listenType` 会变化，登录对照录制保留在 `album_privilege.album-vip.json`。未知专辑 id 返回 `code: 404`；本批录制与探测未发现可达的空结果，`data` 数组本身允许为空。结构定义和类型是 `AlbumPrivilegeBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用后可获取专辑歌曲的音质

**必选参数 :** `id` : 专辑 id

**接口地址 :** `/album/privilege`

**调用例子 :** `/album/privilege?id=168223858`
