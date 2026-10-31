import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 最近联系人记录是附带的用户资料，`userId` 是这条记录自己的编号；`py`、`onlined`、`expertTags`
// 是最近联系人特有或 `UserProfile` 之外的字段，其余字段复用 `UserProfile`。
const RecentContact = UpstreamObject({
  ...UserProfile.schema.fields,
  py: Loose(Schema.String),
  onlined: Loose(Schema.Boolean),
  expertTags: Loose(Schema.Array(Schema.String)),
});

const RecentContactData = UpstreamObject({
  follow: Schema.Array(RecentContact),
});

// 通到最近联系人的路径 `data.follow` 和每条记录的编号 `data.follow[].userId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: RecentContactData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const msgRecentcontact: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/msg/recentcontact/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'msg_recentcontact',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 最近联系
 */
export default msgRecentcontact;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
