import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  page: {
    profile: 'plainMusic',
    target: '/playlist',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
    method: 'GET',
    response: 'text',
  },
} as const satisfies ModuleActions;

const relatedPlaylist: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const response = yield* request('page', {
      query: `id=${String(input.id)}`,
    });
    if (typeof response.body !== 'string') {
      return yield* UnexpectedUpstreamShape.make({
        module: 'related_playlist',
        path: 'body',
        expected: 'HTML text',
        actual: typeof response.body,
      });
    }
    const pattern =
      /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g;
    const playlists = Array.from(
      response.body.matchAll(pattern),
      ([
        ,
        coverImgUrl = '',
        playlistHref = '',
        name = '',
        userHref = '',
        nickname = '',
      ]) => ({
        creator: { userId: userHref.slice('/user/home?id='.length), nickname },
        coverImgUrl: coverImgUrl.replace(/\?param=50y50$/u, ''),
        name,
        id: playlistHref.slice('/playlist?id='.length),
      }),
    );
    return { status: 200, cookie: [], body: { code: 200, playlists } };
  });

export default relatedPlaylist;
