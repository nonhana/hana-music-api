---
title: '用户徽章'
description: '调用此接口，传入用户id，获取用户徽章'
---

# 用户徽章

调用此接口，传入用户id，获取用户徽章

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/user/medal`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `user_medal`                                   |
| SDK 函数   | `userMedal`（`hana-music-api/api/user_medal`） |
| 返回体类型 | `UserMedalBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userMedal } from 'hana-music-api';

const result = await userMedal({
  uid: '32953014',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/medal' \
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

返回体类型：`UserMedalBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_medal`、`hana-music-api/schemas/user_medal` 导入运行时校验器）。

```ts
type MedalResource = {
  actionTitle?: string | null;
  coverUrl?: string | null;
  desUrl?: string | null;
  resId?: string | null;
  resStatus?: number | null;
  resourceTip?: string | null;
  resourceType?: string | null;
  subTitle?: string | null;
  title?: string | null;
};

type MedalWearPic = {
  height?: number | null;
  url?: string | null;
  width?: number | null;
};

type Medal = {
  medalCode: string;
  acceptCondition?: string | null;
  artistName?: string | null;
  backgroundLight?: string | null;
  bizSceneId?: string | null;
  canAcceptTimeEnd?: number | null;
  canAcceptTimeStart?: number | null;
  canWear?: boolean | null;
  centerBasePicUrl?: string | null;
  descriptionText?: string | null;
  entranceShowPicUrl?: string | null;
  high?: number | null;
  homeTable?: string | null;
  levelTitle?: string | null;
  levelTitleShort?: string | null;
  lightImage?: string | null;
  linearGradientBottomColor?: string | null;
  linearGradientTopColor?: string | null;
  low?: number | null;
  medalLevel?: number | null;
  medalLevelAll?: number | null;
  medalName?: string | null;
  medalPicText?: string | null;
  medalPicUrl?: string | null;
  newStyle?: boolean | null;
  obtainTime?: number | null;
  particleImage?: string | null;
  progress?: string | null;
  progressSort?: number | null;
  rankText?: string | null;
  resource?: MedalResource | null;
  sceneIds?: Array<number> | null;
  shineEffect?: boolean | null;
  shouldNotice?: boolean | null;
  showAfterAcceptTimeIfNotObtain?: boolean | null;
  showProgress?: boolean | null;
  showWillObtain?: boolean | null;
  sideBarGuideText?: string | null;
  skipLevel?: boolean | null;
  specialMedalType?: string | null;
  status?: string | null;
  timeAcceptMedal?: boolean | null;
  tips?: string | null;
  wear?: boolean | null;
  wearPic?: string | null;
  wearPicDto?: MedalWearPic | null;
  wearPicV2?: string | null;
};

type LooseMedal = Omit<Medal, 'medalCode'> & {
  medalCode?: string | null;
};

type NextPage = {
  hasMore?: boolean | null;
  pageSize?: number | null;
};

type MedalSubGroup = {
  medals: Array<LooseMedal>;
  hasMore?: boolean | null;
  nextPage?: NextPage | null;
  obtainedTotal?: number | null;
  subGroupCode?: string | null;
  subGroupId?: string | null;
  subGroupTitle?: string | null;
  total?: number | null;
};

type MedalBlock = {
  categoryCode?: string | null;
  categoryId?: string | null;
  categoryTitle?: string | null;
  desc?: string | null;
  medalVOS: Array<LooseMedal>;
  subGroups?: Array<MedalSubGroup> | null;
};

type MedalPage = {
  obtainMedals: Array<Medal>;
  categoryMedalBlockVos: Array<MedalBlock>;
  avatar?: string | null;
  canManageWear?: boolean | null;
  medalNum?: number | null;
  newPageUIAb?: boolean | null;
  nickName?: string | null;
  rankingPer?: number | null;
  showGuide?: boolean | null;
  useMedalTabs?: boolean | null;
};

type UserMedalBody = {
  code: 200;
  data: MedalPage;
  message?: string | null;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                         | 类型                   | 必填 | 说明                         |
| -------------------------------------------- | ---------------------- | ---- | ---------------------------- |
| `code`                                       | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `data`                                       | `MedalPage`            | 是   | 接口返回的数据主体           |
| `data.obtainMedals`                          | `Array<Medal>`         | 是   | -                            |
| `data.categoryMedalBlockVos`                 | `Array<MedalBlock>`    | 是   | -                            |
| `data.categoryMedalBlockVos[].categoryCode`  | `string`               | 否   | -                            |
| `data.categoryMedalBlockVos[].categoryId`    | `string`               | 否   | category ID                  |
| `data.categoryMedalBlockVos[].categoryTitle` | `string`               | 否   | -                            |
| `data.categoryMedalBlockVos[].desc`          | `string`               | 否   | 简介信息                     |
| `data.categoryMedalBlockVos[].medalVOS`      | `Array<LooseMedal>`    | 是   | -                            |
| `data.categoryMedalBlockVos[].subGroups`     | `Array<MedalSubGroup>` | 可空 | -                            |
| `data.avatar`                                | `string`               | 否   | -                            |
| `data.canManageWear`                         | `boolean`              | 否   | -                            |
| `data.medalNum`                              | `number`               | 否   | -                            |
| `data.newPageUIAb`                           | `boolean`              | 否   | -                            |
| `data.nickName`                              | `string`               | 否   | -                            |
| `data.rankingPer`                            | `number`               | 否   | -                            |
| `data.showGuide`                             | `boolean`              | 否   | -                            |
| `data.useMedalTabs`                          | `boolean`              | 否   | -                            |
| `message`                                    | `string`               | 否   | 返回说明信息                 |
| `trp`                                        | `object`               | 否   | -                            |
| `trp.rules`                                  | `Array<string>`        | 否   | -                            |

<!-- api-doc:response:end -->
