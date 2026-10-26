import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MatchedCloudSong = UpstreamObject({
  songId: Schema.Finite,
  addTime: Loose(Schema.Finite),
  album: Loose(Schema.String),
  artist: Loose(Schema.String),
  bitrate: Loose(Schema.Finite),
  cover: Loose(Schema.Finite),
  coverId: Loose(Schema.String),
  fileName: Loose(Schema.String),
  fileSize: Loose(Schema.Finite),
  lyricId: Loose(Schema.String),
  matchType: Loose(Schema.String),
  pcId: Loose(Schema.Finite),
  simpleSong: Loose(LooseSong),
  songName: Loose(Schema.String),
  version: Loose(Schema.Finite),
});

// 返回码、匹配后的云盘记录 `matchData` 和这条记录自己的 `songId` 收紧（匹配后 songId 会变成
// 纠错目标）；`message`、`data` 是附带提示和成功标记，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(Schema.Boolean),
    matchData: MatchedCloudSong,
    message: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const cloudMatch: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
      songId: query.sid,
      adjustSongId: query.asid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/cloud/user/song/match`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('cloud_match', ModuleBody, response),
    };
  });

export default cloudMatch;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
