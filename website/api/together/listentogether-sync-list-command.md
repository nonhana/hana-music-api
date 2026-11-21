---
title: '一起听 - 同步播放列表'
description: '向一起听房间上报当前播放列表快照和列表版本。'
---

# 一起听 - 同步播放列表

向一起听房间上报当前播放列表快照和列表版本。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| 接口地址   | `/listentogether/sync/list/command`                                                      |
| 请求方式   | `GET` / `POST`                                                                           |
| 需要登录   | 是                                                                                       |
| 对应模块   | `listentogether_sync_list_command`                                                       |
| SDK 函数   | `listentogetherSyncListCommand`（`hana-music-api/api/listentogether_sync_list_command`） |
| 返回体类型 | `ListentogetherSyncListCommandBody`（已建模返回体）                                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherSyncListCommand } from 'hana-music-api';

const result = await listentogetherSyncListCommand(
  {
    roomId: 'MzA0NjY5...',
    commandType: 'REPLACE',
    userId: 32953014,
    version: 1,
    displayList: [1372188635, 186016],
    randomList: [1372188635, 186016],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/listentogether/sync/list/command' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"roomId":"MzA0NjY5...","commandType":"REPLACE","userId":32953014,"version":1,"displayList":[1372188635,186016],"randomList":[1372188635,186016]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型                      | 必填 | 默认值 | 说明                                                    |
| ------------- | ------------------------- | ---- | ------ | ------------------------------------------------------- |
| `commandType` | `string`                  | 是   | -      | 列表指令类型，公开资料可见 `REPLACE`、`PLAYMODE_CHANGE` |
| `displayList` | `Array<number \| string>` | 是   | -      | 展示顺序的歌曲 ID 数组                                  |
| `randomList`  | `Array<number \| string>` | 是   | -      | 随机播放顺序的歌曲 ID 数组                              |
| `roomId`      | `string`                  | 是   | -      | 房间 ID                                                 |
| `userId`      | `number \| string`        | 是   | -      | 发起本次列表变更的用户 ID                               |
| `version`     | `number`                  | 是   | -      | 列表递增版本号                                          |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherSyncListCommandBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_sync_list_command`、`hana-music-api/schemas/listentogether_sync_list_command` 导入运行时校验器）。

```ts
type ListentogetherSyncListCommandBody = {
  code: 200;
  data?: {
    message?: string | null;
    result?: boolean | null;
  } | null;
  message?: string | null;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `object`  | 否   | 接口返回的数据主体           |
| `data.message` | `string`  | 否   | 返回说明信息                 |
| `data.result`  | `boolean` | 否   | 接口返回的结果主体           |
| `message`      | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **参数格式**：`displayList` 与 `randomList` 需传入数字/字符串 ID 数组，SDK 会自动编码为上游所需的列表同步载荷；推送后从机可调用 [获取同步歌单](/api/together/listentogether-sync-playlist-get) 拉取快照。
