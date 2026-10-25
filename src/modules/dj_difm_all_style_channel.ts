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

const Channel = UpstreamObject({
  id: Schema.Finite,
  blurCover: Loose(Schema.String),
  chineseName: Loose(Schema.String),
  cover: Loose(Schema.String),
  description: Loose(Schema.String),
  name: Loose(Schema.String),
  radar: Loose(Schema.Array(Schema.Finite)),
  source: Loose(Schema.Finite),
});

const Style = UpstreamObject({
  channels: Schema.Array(Channel),
  chineseName: Loose(Schema.String),
  description: Loose(Schema.String),
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  show: Loose(Schema.Finite),
  source: Loose(Schema.Finite),
});

const SourceGroup = UpstreamObject({
  styles: Schema.Array(Style),
  source: Loose(Schema.Finite),
});

// 通到频道列表的路径 `data[].styles[].channels` 和每个频道自己的编号收紧；风格、来源和频道其余展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SourceGroup),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djDifmAllStyleChannel: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      sources: query.sources || '[0]',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/dj/difm/all/style/channel/v2`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_difm_all_style_channel',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * DIFM电台 - 分类
 */
export default djDifmAllStyleChannel;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
