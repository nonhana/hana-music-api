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

const TicketConfig = UpstreamObject({
  content: Loose(Schema.String),
  picId: Loose(Schema.String),
  picUrl: Loose(Schema.String),
});

const UserPoint = UpstreamObject({
  userId: Schema.Finite,
  balance: Schema.Finite,
  blockBalance: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  version: Loose(Schema.Finite),
});

// 返回码、云贝账户的 `userPoint` 及其记录编号 `userId` 和余额 `balance` 收紧；账户等级、签到标记和
// 票券文案宽松，只见过 null 的配置字段未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    userPoint: UserPoint,
    backupExpireTime: Loose(Schema.Finite),
    expiretime: Loose(Schema.Finite),
    level: Loose(Schema.Finite),
    mobileSign: Loose(Schema.Boolean),
    pcSign: Loose(Schema.Boolean),
    pubwords: Loose(Schema.String),
    storeTitle: Loose(Schema.String),
    ticketConfig: Loose(TicketConfig),
    viptype: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbeiInfo: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/user/info`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('yunbei_info', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝账户信息
 */
export default yunbeiInfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
