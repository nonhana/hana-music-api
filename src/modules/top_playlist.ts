import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import { renameAvatarField } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 分类歌单的摘要共用 `PlaylistSummary`，另声明录制里非 null 的 `alg`、`backgroundImageId`、`originalCoverId`、`tsSongCount`。
const TopPlaylistSummary = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  backgroundImageId: Loose(Schema.Finite),
  originalCoverId: Loose(Schema.Finite),
  tsSongCount: Loose(Schema.Finite),
});

// 通到分类歌单列表的路径 `playlists` 和每个歌单自己的编号 `playlists[].id` 收紧（摘要共用 `PlaylistSummary`）；
// 上游原文的 `avatarImgId_str` 只在成功返回体里改写成 `avatarImgIdStr`，这里描述改写后的最终返回体。
// `limit`/`offset` 等非数字参数时上游回 HTTP 400 空正文，网易云把它归一成 `status: 200`、`body: ''`，
// 空字符串作为独立分支保留，避免把非对象正文误当成功对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      playlists: Schema.Array(TopPlaylistSummary),
      total: Loose(Schema.Finite),
      more: Loose(Schema.Boolean),
      cat: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const topPlaylist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cat: query.cat || '全部', // 全部,华语,欧美,日语,韩语,粤语,小语种,流行,摇滚,民谣,电子,舞曲,说唱,轻音乐,爵士,乡村,R&B/Soul,古典,民族,英伦,金属,朋克,蓝调,雷鬼,世界音乐,拉丁,另类/独立,New Age,古风,后摇,Bossa Nova,清晨,夜晚,学习,工作,午休,下午茶,地铁,驾车,运动,旅行,散步,酒吧,怀旧,清新,浪漫,性感,伤感,治愈,放松,孤独,感动,兴奋,快乐,安静,思念,影视原声,ACG,儿童,校园,游戏,70后,80后,90后,网络歌曲,KTV,经典,翻唱,吉他,钢琴,器乐,榜单,00后
      order: query.order || 'hot', // hot,new
      limit: query.limit || 50,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    // 成功返回体里把 `avatarImgId_str` 改写成 `avatarImgIdStr`（公开行为）；录制保存上游原文，
    // 非 200 业务拒绝由 decodeUpstreamBody 原样透传 response.body，不做改写。
    const body = yield* decodeUpstreamBody(
      'top_playlist',
      ModuleBody,
      response,
      { body: renameAvatarField(response.body) },
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 分类歌单
 */
export default topPlaylist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
