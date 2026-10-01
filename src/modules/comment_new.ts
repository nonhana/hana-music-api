import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  QueryBoolean,
  QueryIdentifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryBooleanLike,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  type: QueryNumberLike;

  cursor?: string;
  pageNo?: QueryNumberLike;
  pageSize?: QueryNumberLike;
  showInner?: QueryBooleanLike;
  sortType?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: QueryIdentifier,
  type: QueryNumber,
  cursor: Schema.optional(Schema.String),
  pageNo: Schema.optional(QueryNumber),
  pageSize: Schema.optional(QueryNumber),
  showInner: Schema.optional(QueryBoolean),
  sortType: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(
    Effect.map((query) => ({
      ...query,
      showInner:
        query.showInner === undefined ||
        query.showInner === true ||
        query.showInner === 1 ||
        query.showInner === '1' ||
        query.showInner === 'true',
    })),
  );

const commentNew: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const threadId = `${resourceType}${String(query.id)}`;
    const pageSize = Number(query.pageSize ?? 20) || 20;
    const pageNo = Number(query.pageNo ?? 1) || 1;
    let sortType = Number(query.sortType) || 99;
    if (sortType === 1) {
      sortType = 99;
    }
    let cursor = '';
    switch (sortType) {
      case 99:
        cursor = String((pageNo - 1) * pageSize);
        break;
      case 2:
        cursor = 'normalHot#' + String((pageNo - 1) * pageSize);
        break;
      case 3:
        cursor = query.cursor || '0';
        break;
      default:
        break;
    }
    const data = {
      threadId,
      pageNo,
      showInner: query.showInner ?? true,
      pageSize,
      cursor,
      sortType, //99:按推荐排序,2:按热度排序,3:按时间排序
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v2/resource/comments`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 评论
 */
export default commentNew;
