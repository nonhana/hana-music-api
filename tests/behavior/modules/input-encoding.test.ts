import { expect, test } from 'bun:test';

import { createServer } from '../../../src/server/create-server.ts';
import { generatedModuleRoutes } from '../../../src/types/generated/module-surface.generated.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import { cases as accountCases } from './input-encoding/account.ts';
import { cases as albumCases } from './input-encoding/album.ts';
import { cases as artistCases } from './input-encoding/artist.ts';
import { cases as commentCases } from './input-encoding/comment.ts';
import type { EncodingWire } from './input-encoding/contract.ts';
import { cases as djCases } from './input-encoding/dj.ts';
import { cases as libraryCases } from './input-encoding/library.ts';
import { cases as miscCases } from './input-encoding/misc.ts';
import { cases as msgTopicCases } from './input-encoding/msg-topic.ts';
import { cases as musicianSigninCases } from './input-encoding/musician-signin.ts';
import { cases as playbackVideoCases } from './input-encoding/playback-video.ts';
import { cases as playlistCases } from './input-encoding/playlist.ts';
import { cases as programVoiceCases } from './input-encoding/program-voice.ts';
import { cases as searchDiscoveryCases } from './input-encoding/search-discovery.ts';
import { cases as socialCases } from './input-encoding/social.ts';
import { cases as songLyricCases } from './input-encoding/song-lyric.ts';
import { cases as toplistStyleCases } from './input-encoding/toplist-style.ts';
import { cases as userCases } from './input-encoding/user.ts';
import { cases as vipYunbeiCases } from './input-encoding/vip-yunbei.ts';

const allCases = [
  accountCases,
  albumCases,
  artistCases,
  commentCases,
  djCases,
  libraryCases,
  miscCases,
  msgTopicCases,
  musicianSigninCases,
  playbackVideoCases,
  playlistCases,
  programVoiceCases,
  searchDiscoveryCases,
  socialCases,
  songLyricCases,
  toplistStyleCases,
  userCases,
  vipYunbeiCases,
].flat();

for (const testCase of allCases) {
  test(`${testCase.module} sends its declared business encoding`, async () => {
    const wires: Array<EncodingWire> = [];
    const app = await createServer(
      {},
      {
        execution: {
          entropy: testEntropy,
          fetcher: async (request, init) => {
            const wire = {
              url: request instanceof Request ? request.url : String(request),
              body: typeof init?.body === 'string' ? init.body : '',
            };
            wires.push(wire);
            return (
              testCase.respond?.(wire, wires.length - 1) ??
              Response.json({
                code: 200,
                data: {},
                lrc: { lyric: '' },
                privileges: [],
                songs: [],
              })
            );
          },
        },
      },
    );
    await app.request(
      generatedModuleRoutes[
        testCase.module as keyof typeof generatedModuleRoutes
      ],
      {
        method: 'POST',
        headers: {
          cookie: 'MUSIC_U=test',
          'content-type': 'application/json',
        },
        body: JSON.stringify(testCase.input),
      },
    );
    expect(wires.length).toBeGreaterThan(0);
    testCase.check(wires);
  });
}
