import { expect, test } from 'bun:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Exit } from 'effect';

import { loadModuleDefinitions } from '../../../src/server/module-loader.ts';
import { runExit } from '../../_kit/it.ts';
import { cases as accountCases } from './input-contracts/account.ts';
import { cases as albumCases } from './input-contracts/album.ts';
import { cases as artistCases } from './input-contracts/artist.ts';
import { cases as commentCases } from './input-contracts/comment.ts';
import { cases as djCases } from './input-contracts/dj.ts';
import { cases as libraryCases } from './input-contracts/library.ts';
import { cases as miscCases } from './input-contracts/misc.ts';
import { cases as msgTopicCases } from './input-contracts/msg-topic.ts';
import { cases as musicianSigninCases } from './input-contracts/musician-signin.ts';
import { cases as playbackVideoCases } from './input-contracts/playback-video.ts';
import { cases as playlistCases } from './input-contracts/playlist.ts';
import { cases as programVoiceCases } from './input-contracts/program-voice.ts';
import { cases as searchDiscoveryCases } from './input-contracts/search-discovery.ts';
import { cases as socialCases } from './input-contracts/social.ts';
import { cases as songLyricCases } from './input-contracts/song-lyric.ts';
import { cases as toplistStyleCases } from './input-contracts/toplist-style.ts';
import { cases as userCases } from './input-contracts/user.ts';
import { cases as vipYunbeiCases } from './input-contracts/vip-yunbei.ts';

const REAL_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../src/modules',
);

const definitionsPromise = loadModuleDefinitions(REAL_MODULES_DIRECTORY);

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

const definitionOf = async (identifier: string) => {
  const definitions = await definitionsPromise;
  const found = definitions.find(({ identifier: name }) => name === identifier);
  if (found === undefined) {
    throw new Error(`Module "${identifier}" is not registered`);
  }
  return found;
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

test('every registered module has an input contract', async () => {
  const definitions = await definitionsPromise;
  const registered = new Set(definitions.map(({ identifier }) => identifier));
  const covered = new Set(allCases.map(({ module }) => module));
  expect(allCases.length).toBe(covered.size);
  expect([...registered].filter((name) => !covered.has(name))).toEqual([]);
  expect([...covered].filter((name) => !registered.has(name))).toEqual([]);
});

for (const testCase of allCases) {
  test(`${testCase.module} decodes its declared input`, async () => {
    const definition = await definitionOf(testCase.module);
    expect(testCase.valid.length).toBeGreaterThan(0);
    for (const value of testCase.valid) {
      const exit = await runExit(definition.decodeInput(value));
      if (Exit.isFailure(exit)) {
        throw new Error(
          `${testCase.module} rejected valid input ${JSON.stringify(value)}`,
        );
      }
    }
    const invalid: Array<unknown> = [...testCase.invalid];
    const sample = testCase.valid[0];
    if (testCase.open !== true && isPlainRecord(sample)) {
      invalid.push({ ...sample, __unexpected: true });
    }
    expect(invalid.length).toBeGreaterThan(0);
    for (const value of invalid) {
      const exit = await runExit(definition.decodeInput(value));
      if (Exit.isSuccess(exit)) {
        throw new Error(
          `${testCase.module} accepted invalid input ${JSON.stringify(value)}`,
        );
      }
    }
  });
}
