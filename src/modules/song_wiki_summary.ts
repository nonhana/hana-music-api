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

const ClickAction = UpstreamObject({
  clickAction: Loose(
    UpstreamObject({
      action: Loose(Schema.Finite),
      targetUrl: Loose(Schema.String),
    }),
  ),
});

const UiImage = UpstreamObject({
  height: Loose(Schema.Finite),
  imageId: Loose(Schema.Finite),
  imageUrl: Loose(Schema.String),
  title: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const UiTextLink = UpstreamObject({
  text: Loose(Schema.String),
  url: Loose(Schema.String),
});

const UiSubTitle = UpstreamObject({
  action: Loose(ClickAction),
  title: Loose(Schema.String),
});

const UiButton = UpstreamObject({
  action: Loose(ClickAction),
  tag: Loose(Schema.String),
  text: Loose(Schema.String),
});

const UiDescription = UpstreamObject({
  description: Loose(Schema.String),
});

const UiMainTitle = UpstreamObject({
  action: Loose(ClickAction),
  title: Loose(Schema.String),
});

const UiElement = UpstreamObject({
  buttons: Loose(Schema.Array(UiButton)),
  descriptions: Loose(Schema.Array(UiDescription)),
  images: Loose(Schema.Array(UiImage)),
  mainTitle: Loose(UiMainTitle),
  subTitles: Loose(Schema.Array(UiSubTitle)),
  textLinks: Loose(Schema.Array(UiTextLink)),
  type: Loose(Schema.String),
});

const ResourceExt = UpstreamObject({
  musicMemoryTextType: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  specialType: Loose(Schema.Finite),
});

const Resource = UpstreamObject({
  action: Loose(ClickAction),
  alg: Loose(Schema.String),
  resourceExt: Loose(ResourceExt),
  resourceId: Loose(Schema.String),
  resourceType: Loose(Schema.String),
  uiElement: Loose(UiElement),
  valid: Loose(Schema.Boolean),
});

const Creative = UpstreamObject({
  creativeType: Loose(Schema.String),
  position: Loose(Schema.String),
  resources: Loose(Schema.Array(Resource)),
  uiElement: Loose(UiElement),
});

const Block = UpstreamObject({
  alg: Loose(Schema.String),
  canRefresh: Loose(Schema.Boolean),
  channel: Loose(Schema.String),
  code: Loose(Schema.String),
  creatives: Loose(Schema.Array(Creative)),
  hasMore: Loose(Schema.Boolean),
  hideTitle: Loose(Schema.Boolean),
  id: Schema.String,
  opRcmd: Loose(Schema.Finite),
  position: Loose(Schema.String),
  scm: Loose(Schema.String),
  showType: Loose(Schema.String),
  uiElement: Loose(UiElement),
});

// 通到百科页区块的路径 `data`、`data.blocks` 和每个区块自己的字符串编号 `data.blocks[].id` 收紧；区块内容是按 showType 组装的 UI 树，标题、图片、按钮、资源等字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      blocks: Schema.Array(Block),
      cursor: Loose(Schema.String),
      hasMore: Loose(Schema.Boolean),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songWikiSummary: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/song/play/about/block/page`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_wiki_summary',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 音乐百科基础信息
 */
export default songWikiSummary;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
