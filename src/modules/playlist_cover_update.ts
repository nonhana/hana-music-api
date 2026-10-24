import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  UploadedFile,
} from '../core/module-input.ts';
import { uploadWork } from '../core/upload-work.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import uploadPlugin from '../plugins/upload.ts';
import type { ModuleEffect, ModuleResponse } from '../types/index.ts';
import type {
  LegacyUploadedFile,
  QueryIdentifier,
} from '../types/module-shared.ts';

export type ModuleInput = {
  imgFile?: LegacyUploadedFile;
  imgId?: QueryIdentifier;

  id?: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  imgFile: Schema.optional(UploadedFile),
  imgId: Schema.optional(Identifier),
  id: Schema.optional(Identifier),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const UpstreamBody = UpstreamObject({
  code: Schema.Literal(200),
  url: Loose(Schema.String),
});

const InvalidInputBody = UpstreamObject({
  code: Schema.Literal(400),
  msg: Loose(Schema.String),
});

// 返回码和上传结果的路径收紧；封面地址与错误说明宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamBody,
    }),
    InvalidInputBody,
  ]),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistCoverUpdate: ModuleEffect<ModuleInput, ModuleBody> = (
  input,
  request,
) => {
  const { imgFile, imgId } = input;
  if (imgFile && imgId !== undefined) {
    return Effect.succeed<ModuleResponse<ModuleBody>>({
      status: 400,
      cookie: [],
      body: {
        code: 400,
        msg: 'imgFile and imgId cannot be used together',
      },
    });
  }
  if (!imgFile && imgId === undefined) {
    return Effect.succeed<ModuleResponse<ModuleBody>>({
      status: 400,
      cookie: [],
      body: {
        code: 400,
        msg: 'imgFile or imgId is required',
      },
    });
  }
  return uploadWork('playlist_cover_update', request, (stage) =>
    Effect.gen(function* () {
      const call = yield* Call;
      const uploaded = imgFile
        ? yield* uploadPlugin({ imgFile }, stage)
        : undefined;
      const response = yield* stage({
        target: '/api/playlist/cover/update',
        protocol: call.config.crypto || 'weapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          id: input.id,
          coverImgId: uploaded?.imgId ?? imgId,
        }),
        response: 'json',
        semantic: 'write',
      });
      const upstreamBody = yield* decodeUpstreamBody(
        'playlist_cover_update',
        UpstreamBody,
        response,
      );
      return {
        status: 200,
        cookie: [],
        body: { code: 200, data: { ...uploaded, ...upstreamBody } },
      };
    }),
  );
};

export default playlistCoverUpdate;
