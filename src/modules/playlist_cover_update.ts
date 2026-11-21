import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
  UploadedFile,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { uploadWork } from '../core/upload-work.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import uploadPlugin, { imageUploadActions } from '../plugins/upload.ts';
import type { ModuleEffect, ModuleResponse } from '../types/index.ts';

export const moduleActions = {
  ...imageUploadActions,
  submit: {
    profile: 'web',
    target: '/api/playlist/cover/update',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  id: NumberId;
  imgFile?: typeof UploadedFile.Type;
  imgId?: string | number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  imgFile: Schema.optional(UploadedFile),
  imgId: Schema.optional(Schema.Union([Schema.String, Schema.Finite])),
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
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamBody,
    }),
    InvalidInputBody,
  ]),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const playlistCoverUpdate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (input, request) => {
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
      const uploaded = imgFile
        ? yield* uploadPlugin({ imgFile }, stage)
        : undefined;
      const response = yield* stage('submit', {
        data: {
          id: input.id,
          coverImgId: uploaded?.imgId ?? imgId,
        },
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
