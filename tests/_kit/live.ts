import { readFile } from 'node:fs/promises';

import type { createHanaMusicApi } from '../../index.ts';
import { redact } from '../../scripts/lib/redaction.ts';
import { isRecord } from '../../src/core/utils.ts';

export const readLiveOptions = async (
  env: Readonly<Record<string, string | undefined>>,
) => {
  if (env.LIVE_UPSTREAM !== '1')
    throw new Error('live blocked: LIVE_UPSTREAM must equal 1');
  const suite = env.HANA_LIVE_SUITE ?? 'anonymous';
  if (!['anonymous', 'authenticated', 'writes'].includes(suite))
    throw new Error('live blocked: unknown suite');
  let cookie: string | undefined;
  let expectedUid: number | undefined;
  let playlistId: number | undefined;
  let token: string | undefined;
  if (suite !== 'anonymous') {
    if (
      env.NCM_LIVE_COOKIE !== undefined &&
      env.NCM_LIVE_COOKIE_FILE !== undefined
    )
      throw new Error('live blocked: conflicting cookie sources');
    try {
      cookie =
        env.NCM_LIVE_COOKIE ??
        (env.NCM_LIVE_COOKIE_FILE
          ? await readFile(env.NCM_LIVE_COOKIE_FILE, 'utf8')
          : undefined);
    } catch {
      throw new Error('live blocked: unreadable cookie file');
    }
    cookie = cookie?.trim();
    expectedUid = Number(env.NCM_LIVE_EXPECTED_UID);
    if (
      !cookie ||
      !/(?:^|;\s*)MUSIC_U=\S+/.test(cookie) ||
      !Number.isSafeInteger(expectedUid) ||
      expectedUid <= 0
    )
      throw new Error('live blocked: current login and expected UID required');
  }
  if (suite === 'writes') {
    if (
      env.HANA_LIVE_ALLOW_WRITE !== '1' ||
      !env.HANA_LIVE_WRITE_AUTHORIZATION?.trim()
    )
      throw new Error(
        'live blocked: current write and restoration authorization required',
      );
    playlistId = Number(env.NCM_LIVE_PLAYLIST_ID);
    if (
      !Number.isSafeInteger(playlistId) ||
      playlistId <= 0 ||
      !env.NCM_LIVE_CHECK_TOKEN_FILE
    )
      throw new Error(
        'live blocked: one authorized playlist and fresh token file required',
      );
    try {
      token = (await readFile(env.NCM_LIVE_CHECK_TOKEN_FILE, 'utf8')).trim();
    } catch {
      throw new Error('live blocked: unreadable fresh token file');
    }
    if (!token) throw new Error('live blocked: empty fresh token');
  }
  return {
    suite,
    cookie,
    expectedUid,
    playlistId,
    token,
    region: env.HANA_LIVE_REGION ?? 'unknown',
    authorization:
      suite === 'writes' ? env.HANA_LIVE_WRITE_AUTHORIZATION : undefined,
  };
};

export const safeLiveFailure = (step: string, error: unknown) => {
  // 不把上游正文、Cookie、令牌或原始 cause 交给 Bun 的异常打印器。
  const status =
    isRecord(error) && typeof error.status === 'number'
      ? error.status
      : undefined;
  return redact({ step, category: 'live-check-failed', status }, 'failure');
};

const requireValue = (condition: unknown) => {
  if (!condition) throw new Error('live business assertion failed');
};

const bodyOf = (response: { status: number; body: unknown }) => {
  requireValue(
    response.status === 200 &&
      isRecord(response.body) &&
      response.body.code === 200,
  );
  if (!isRecord(response.body)) throw new Error('live body is not an object');
  return response.body;
};

export const createLiveSession = (
  options: Awaited<ReturnType<typeof readLiveOptions>>,
  factory: typeof createHanaMusicApi,
  pause: () => Promise<void> = () => Bun.sleep(1500),
) => {
  const attempts = { business: 0, cleanup: 0 };
  const events: Array<{ phase: string; url: string; attempt: number }> = [];
  const failures: Array<unknown> = [];
  let phase: 'business' | 'cleanup' = 'business';
  let stopped = false;
  let restoration = 'not-needed';
  let step = 'initialization';
  let verifiedUid: number | undefined;
  const client = factory({
    cookie: options.cookie,
    cache: { enabled: false },
    retry: { retries: 0 },
    timeoutMs: 30_000,
    onRequestEvent: (event) => {
      if (event.type !== 'attempt') return;
      const limit =
        phase === 'cleanup' ? 6 : options.suite === 'writes' ? 30 : 12;
      if ((stopped && phase === 'business') || attempts[phase] >= limit)
        throw new Error('live budget exhausted or scenario stopped');
      attempts[phase]++;
      events.push({
        phase,
        url: new URL(event.url).origin + new URL(event.url).pathname,
        attempt: event.attempt,
      });
    },
  });
  const run = async (name: string, work: () => Promise<void>) => {
    if (stopped) throw new Error('live scenario stopped after earlier failure');
    step = name;
    try {
      await work();
    } catch (error) {
      stopped = true;
      const safe = safeLiveFailure(step, error);
      failures.push(safe);
      // 原始 cause 可能带凭据，只允许 reporter 打印脱敏摘要。
      // oxlint-disable-next-line preserve-caught-error
      throw new Error(`live failed: ${step}; see sanitized summary`, {
        cause: safe,
      });
    }
  };
  const account = async () => {
    const response = await client.loginStatus({});
    requireValue(response.status === 200 && isRecord(response.body.data));
    const data = response.body.data;
    requireValue(
      data.code === 200 &&
        data.account?.anonimousUser === false &&
        data.account?.id === options.expectedUid &&
        data.profile?.userId === options.expectedUid,
    );
    verifiedUid = data.account?.id;
  };
  const collection = async () => {
    for (let page = 0; page < 5; page++) {
      const body = bodyOf(
        await client.userPlaylist({
          uid: options.expectedUid!,
          limit: 1000,
          offset: page * 1000,
        }),
      );
      requireValue(
        Array.isArray(body.playlist) && typeof body.more === 'boolean',
      );
      if (!Array.isArray(body.playlist))
        throw new Error('invalid playlist page');
      const found = body.playlist.some(
        (entry: unknown) => isRecord(entry) && entry.id === options.playlistId,
      );
      if (found) return true;
      if (body.more === false) return false;
    }
    throw new Error(
      'initial collection or restoration incomplete after five pages',
    );
  };
  return {
    snapshot: () => ({
      identityClass:
        options.suite === 'anonymous' ? 'anonymous' : 'authenticated',
      region: options.region,
      expectedUid: options.expectedUid,
      verifiedUid,
      playlistId: options.playlistId,
      attempts: { ...attempts },
      events,
      failures,
      restoration,
      authorization: options.authorization,
    }),
    searchToDetail: () =>
      run('search-to-detail', async () => {
        const searched = bodyOf(
          await client.search({ keywords: '周杰伦', limit: 3 }),
        );
        const result = searched.result;
        requireValue(isRecord(result) && Array.isArray(result.songs));
        if (!isRecord(result) || !Array.isArray(result.songs))
          throw new Error('invalid search');
        const first: unknown = result.songs[0];
        requireValue(
          isRecord(first) &&
            Number.isSafeInteger(first.id) &&
            Number(first.id) > 0,
        );
        if (!isRecord(first) || typeof first.id !== 'number')
          throw new Error('invalid song ID');
        const detail = bodyOf(await client.songDetail({ ids: [first.id] }));
        requireValue(
          Array.isArray(detail.songs) &&
            detail.songs.some(
              (song: unknown) => isRecord(song) && song.id === first.id,
            ),
        );
        const lyric = bodyOf(await client.lyric({ id: first.id }));
        requireValue(
          (isRecord(lyric.lrc) && typeof lyric.lrc.lyric === 'string') ||
            lyric.uncollected === true,
        );
      }),
    catalog: () =>
      run('catalog', async () => {
        const top = bodyOf(await client.toplist({}));
        requireValue(
          Array.isArray(top.list) &&
            top.list.length > 0 &&
            top.list.every(
              (entry: unknown) => isRecord(entry) && Number(entry.id) > 0,
            ),
        );
        const artist = bodyOf(await client.artistDetail({ id: 6452 }));
        requireValue(
          isRecord(artist.data) &&
            isRecord(artist.data.artist) &&
            artist.data.artist.id === 6452,
        );
      }),
    account: () => run('account', account),
    playlistCycle: () =>
      run('playlist-subscribe-cycle', async () => {
        requireValue(
          options.suite === 'writes' &&
            options.token &&
            options.playlistId &&
            options.authorization,
        );
        let subscribeAttempted = false;
        try {
          await account();
          const detail = bodyOf(
            await client.playlistDetail({ id: options.playlistId! }),
          );
          requireValue(
            isRecord(detail.playlist) &&
              detail.playlist.id === options.playlistId &&
              isRecord(detail.playlist.creator) &&
              typeof detail.playlist.creator.userId === 'number' &&
              Number.isSafeInteger(detail.playlist.creator.userId) &&
              detail.playlist.creator.userId > 0 &&
              detail.playlist.creator.userId !== options.expectedUid &&
              detail.playlist.subscribed === false,
          );
          requireValue(!(await collection()));
          let tokenUsed = false;
          subscribeAttempted = true;
          restoration = 'unconfirmed';
          bodyOf(
            await client.playlistSubscribe(
              { id: options.playlistId!, t: 1 },
              {
                checkToken: async () => {
                  if (tokenUsed)
                    throw new Error('fresh token already consumed');
                  tokenUsed = true;
                  return options.token!;
                },
              },
            ),
          );
          let collected = false;
          for (
            let confirmation = 0;
            confirmation < 2 && !collected;
            confirmation++
          ) {
            await pause();
            collected = await collection();
          }
          requireValue(collected);
          bodyOf(
            await client.playlistSubscribe({ id: options.playlistId!, t: 0 }),
          );
          let restored = false;
          for (
            let confirmation = 0;
            confirmation < 2 && !restored;
            confirmation++
          ) {
            await pause();
            restored = !(await collection());
          }
          requireValue(restored);
          restoration = 'confirmed';
        } finally {
          if (subscribeAttempted && restoration !== 'confirmed') {
            phase = 'cleanup';
            try {
              if (
                !events.some((event) =>
                  event.url.endsWith('/playlist/unsubscribe'),
                )
              ) {
                bodyOf(
                  await client.playlistSubscribe({
                    id: options.playlistId!,
                    t: 0,
                  }),
                );
              }
              await pause();
              requireValue(!(await collection()));
              restoration = 'confirmed';
            } catch (error) {
              failures.push(safeLiveFailure('restoration', error));
              restoration = 'unconfirmed';
            } finally {
              phase = 'business';
            }
          }
        }
        requireValue(restoration === 'confirmed');
      }),
  };
};

let current: Promise<ReturnType<typeof createLiveSession>> | undefined;
export const installedLiveSession = () =>
  (current ??= (async () => {
    const options = await readLiveOptions(process.env);
    const entry = process.env.HANA_LIVE_PACKAGE_ENTRY;
    if (!entry)
      throw new Error(
        'live blocked: use test:live to validate the installed candidate',
      );
    const module: { createHanaMusicApi: typeof createHanaMusicApi } =
      await import(entry);
    return createLiveSession(options, module.createHanaMusicApi);
  })());
