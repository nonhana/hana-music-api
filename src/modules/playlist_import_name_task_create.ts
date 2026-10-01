import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

interface PlaylistImportLocalEntry {
  album?: string;
  artist?: string;
  name?: string;
}

const playlistImportNameTaskCreate: ModuleEffect<ModuleInput> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (
      query.text !== undefined &&
      query.text !== null &&
      typeof query.text !== 'string' &&
      typeof query.text !== 'number' &&
      typeof query.text !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'text must be a primitive value',
      });
    }
    let data: Record<string, unknown> = {
      importStarPlaylist: query.importStarPlaylist || false, // 导入我喜欢的音乐
    };

    if (query.local) {
      // 元数据导入
      const local = readPlaylistImportLocalEntries(query.local);
      const multiSongs = JSON.stringify(
        local.map((e) => ({
          songName: e.name,
          artistName: e.artist,
          albumName: e.album,
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
            url: encodeURI(
              'rpc://playlist/import?text='.concat(String(query.text)),
            ),
          },
        ]);
      }

      if (query.link) {
        // 链接导入
        const link = readPlaylistImportLinks(query.link);
        songs = JSON.stringify(
          link.map((e: string) => ({
            name: playlistName,
            type: '',
            url: encodeURI(e),
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
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/import/name/task/create`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 歌单导入 - 元数据/文字/链接导入
 */
export default playlistImportNameTaskCreate;

const readPlaylistImportLocalEntries = (
  value: unknown,
): Array<PlaylistImportLocalEntry> => {
  const parsed = readJsonArray(value);

  return parsed
    .filter((entry): entry is Record<string, unknown> => isRecordLike(entry))
    .map((entry) => ({
      album: typeof entry.album === 'string' ? entry.album : undefined,
      artist: typeof entry.artist === 'string' ? entry.artist : undefined,
      name: typeof entry.name === 'string' ? entry.name : undefined,
    }));
};

const readPlaylistImportLinks = (value: unknown): Array<string> =>
  readJsonArray(value)
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry);

const readJsonArray = (value: unknown): Array<unknown> => {
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isRecordLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
