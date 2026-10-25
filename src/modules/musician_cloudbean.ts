import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const CloudbeanData = UpstreamObject({
  artistId: Schema.Finite,
  cloudBean: Schema.Finite,
  maxCloudBean: Loose(Schema.Finite),
  needPop: Loose(Schema.Boolean),
  signed: Loose(Schema.Boolean),
});

// 返回码、云豆对象 `data`、音乐人自己的编号 `data.artistId` 和接口要拿的云豆数 `data.cloudBean` 收紧；
// 其余声明字段宽松，未声明字段原样保留（`musicianLevel`、`flowStage`、`dynamicNews` 只见过 `null`）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: CloudbeanData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const musicianCloudbean: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/cloudbean/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'musician_cloudbean',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 账号云豆数
 */
export default musicianCloudbean;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
