import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  LooseSongPrivilege,
  ProgramMainSong,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 私人 DJ 载荷里的旧版歌曲：复用节目记录的歌曲字段，另补 `alias`/`transName`/`transNames`；
// 它在宽松的 `value` 里，歌曲编号也宽松。
const AiDjSong = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  alias: Loose(Schema.Array(Schema.String)),
  transName: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
});

// 私人 DJ 的 DJ 声音：音频编号、地址、时长、文案等展示字段，全部宽松。
const AiDjAudio = UpstreamObject({
  audioId: Loose(Schema.String),
  audioUrl: Loose(Schema.String),
  detailCategory: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  fadeInOut: Loose(Schema.Boolean),
  gain: Loose(Schema.Finite),
  includeVoice: Loose(Schema.Boolean),
  introductionRelatedSongIds: Loose(Schema.Array(Schema.Finite)),
  nosKey: Loose(Schema.String),
  peak: Loose(Schema.Finite),
  poolCode: Loose(Schema.String),
  size: Loose(Schema.Finite),
  textType: Loose(Schema.String),
  timbreKey: Loose(Schema.String),
  validTime: Loose(Schema.Finite),
});

// 私人 DJ 资源载荷：歌曲和 DJ 声音两种形状的字段放在同一对象里，全部宽松。
const AiDjValue = UpstreamObject({
  alg: Loose(Schema.String),
  audioList: Loose(Schema.Array(AiDjAudio)),
  includeVoice: Loose(Schema.Boolean),
  songData: Loose(AiDjSong),
  songId: Loose(Schema.String),
  songPrivilege: Loose(LooseSongPrivilege),
});

// 私人 DJ 资源：`type` 是资源类型，`value` 是附带的歌曲或 DJ 声音，整体宽松。
const AiDjResource = UpstreamObject({
  type: Loose(Schema.String),
  value: Loose(AiDjValue),
});

// 通到私人 DJ 资源的 `data.aiDjResources` 收紧；资源载荷、场景名和埋点字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      aiDjResources: Schema.Array(AiDjResource),
      tagName: Loose(Schema.String),
    }),
    message: Loose(Schema.String),
    trp: Loose(UpstreamObject({ rules: Loose(Schema.Array(Schema.String)) })),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

// 实际请求参数如下，部分内容省略，敏感信息已进行混淆，可按需修改此 API 的代码：
/* {"extInfo":"{\"lastRequestTimestamp\":1692358373509,\"lbsInfoList\":[{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692358543},{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692055283}],\"listenedTs\":false,\"noAidjToAidj\":true}","header":"{}"} */
const aidjContentRcmd: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const extInfo: Record<string, unknown> = {};
    if (query.latitude !== undefined) {
      extInfo.lbsInfoList = [
        {
          lat: query.latitude,
          lon: query.longitude,
          time: Math.floor(Date.now() / 1000),
        },
      ];
    }
    extInfo.noAidjToAidj = false;
    extInfo.lastRequestTimestamp = Date.now();
    extInfo.listenedTs = false;
    const data = {
      extInfo: JSON.stringify(extInfo),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/aidj/content/rcmd/info`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'aidj_content_rcmd',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 私人 DJ
 */
export default aidjContentRcmd;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
