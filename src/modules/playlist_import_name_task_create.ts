import { Effect, Schema } from 'effect';

import {
  BooleanValue,
  decodeModuleInput as decodeInput,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

const PlaylistImportLocalEntry = Schema.Struct({
  album: Schema.optional(Schema.String),
  artist: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
});

// 返回码收紧；导入任务的 `data`、`taskId` 和说明文字宽松，`local`/`link` 分支没有录制，不收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(UpstreamObject({ taskId: Loose(Schema.Finite) })),
    msg: Loose(Schema.String),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = {
  importStarPlaylist?: boolean;
  link?: ReadonlyArray<string>;
  local?: ReadonlyArray<typeof PlaylistImportLocalEntry.Type>;
  playlistName?: string;
  text?: string;
};

const inputSchema = Schema.Struct({
  importStarPlaylist: Schema.optional(BooleanValue),
  link: Schema.optional(Schema.Array(Schema.String)),
  local: Schema.optional(Schema.Array(PlaylistImportLocalEntry)),
  playlistName: Schema.optional(Schema.String),
  text: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  local: {
    target: '/api/playlist/import/name/task/create',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  text: {
    target: '/api/playlist/import/name/task/create',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  link: {
    target: '/api/playlist/import/name/task/create',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  empty: {
    target: '/api/playlist/import/name/task/create',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistImportNameTaskCreate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    let data: Record<string, unknown> = {
      importStarPlaylist: query.importStarPlaylist || false, // 导入我喜欢的音乐
    };

    if (query.local) {
      // 元数据导入
      const multiSongs = JSON.stringify(
        query.local.map((entry) => ({
          songName: entry.name,
          artistName: entry.artist,
          albumName: entry.album,
        })),
      );
      data = {
        ...data,
        multiSongs,
      };
    } else {
      const playlistName =
        query.playlistName || '导入音乐 '.concat(new Date().toLocaleString()); // 歌单名称
      let songs = '';
      if (query.text) {
        // 文字导入
        songs = JSON.stringify([
          {
            name: playlistName,
            type: '',
            url: encodeURI('rpc://playlist/import?text='.concat(query.text)),
          },
        ]);
      }

      if (query.link) {
        // 链接导入
        songs = JSON.stringify(
          query.link.map((link) => ({
            name: playlistName,
            type: '',
            url: encodeURI(link),
          })),
        );
      }
      data = {
        ...data,
        playlistName,
        createBusinessCode: undefined,
        extParam: undefined,
        taskIdForLog: '',
        songs,
      };
    }
    const action = query.local
      ? 'local'
      : query.link
        ? 'link'
        : query.text
          ? 'text'
          : 'empty';
    const response = yield* request(action, { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_import_name_task_create',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 歌单导入 - 元数据/文字/链接导入
 */
export default playlistImportNameTaskCreate;
