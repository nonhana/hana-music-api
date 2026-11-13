import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';

import {
  audit,
  checkCoverage,
  matchRules,
} from '../../../scripts/audit-upstream-endpoints.mts';
import baseline from '../../fixtures/upstream-policy/baseline-actions-472dbc5.json';
import migration from '../../fixtures/upstream-policy/web-migration-2026-11.json';
import snapshot from '../../fixtures/upstream-policy/yidun-web-2026-11-13.json';

test('upstream audit snapshot preserves the fixed official configuration', () => {
  expect(
    createHash('sha256')
      .update(JSON.stringify(snapshot, null, 2))
      .digest('hex'),
  ).toBe('ffe2b2e995223fbdd40347fd89601cf77eb3f06dc829264bc3dafbd37a00c375');
  const rules = snapshot.data['yidun#paths'].whiteList;
  expect(rules).toHaveLength(30);
  expect(rules.flatMap((rule) => rule.list)).toHaveLength(446);
  expect(new Set(rules.flatMap((rule) => rule.list)).size).toBe(224);
  expect(baseline).toHaveLength(389);
  expect(
    baseline.filter(
      (entry) =>
        typeof entry.target === 'string' && matchRules(entry.target).length > 0,
    ),
  ).toHaveLength(35);
});

test('upstream audit matches ordered rules, dynamic paths and batch children without alias guessing', () => {
  expect(matchRules('/api/song/like').map((entry) => entry.index)).toEqual([
    1, 29,
  ]);
  expect(matchRules('/api/song/like').at(-1)?.businessId).toBe(
    'afb1a8e61222dcc4b7a733ca69f089cb',
  );
  expect(matchRules('/api/user/follow/123').length).toBeGreaterThan(0);
  expect(matchRules('/api/user/following/123')).toEqual([]);
  expect(matchRules('/api/radio/like')).toEqual([]);
  expect(matchRules('/api/event/get/123')).toEqual([]);
  expect(matchRules('/api/playlist/desc/update').length).toBeGreaterThan(0);
  expect(matchRules('https://nosup-hz1.127.net/api/song/like')).toEqual([]);
  expect(matchRules('https://clientlog.music.163.com/api/song/like')).toEqual(
    [],
  );
});

test('upstream audit classifies every current action and preserves the migration matrix', () => {
  expect(audit().modules).toBe(352);
  expect(checkCoverage()).toEqual([]);
  expect(audit().actions).toHaveLength(390);
  expect(
    checkCoverage(audit().actions, migration.eapiDispositions.slice(1)),
  ).toContain('activate_init_profile.request: 0 dispositions');
  expect(
    checkCoverage(audit().actions, [
      ...migration.eapiDispositions,
      migration.eapiDispositions[0]!,
    ]),
  ).toContain('activate_init_profile.request: 2 dispositions');
  expect(
    checkCoverage(audit().actions, [
      ...migration.eapiDispositions,
      { ...migration.eapiDispositions[0]!, module: 'unknown' },
    ]),
  ).toContain('Unknown disposition: unknown.request');
  expect(checkCoverage(audit().actions.slice(1)).length).toBeGreaterThan(0);
  expect(
    checkCoverage([
      ...audit().actions,
      { ...audit().actions[0]!, action: 'unknown' },
    ]),
  ).toContain('Unclassified action: activate_init_profile.unknown');
});

test('upstream audit attaches representative paths and ordered matches to their dynamic actions', () => {
  const actions = audit().actions;
  const followed = actions.find(
    (entry) => entry.module === 'follow' && entry.action === 'follow',
  )!;
  expect(followed.matchScope).toBe('representative-only');
  expect(followed.matches?.map((entry) => entry.index)).toEqual([1, 29]);
  expect(followed.samples[0]?.url).toContain('/api/user/follow/');
  const batch = actions.find(
    (entry) => entry.module === 'playlist_update' && entry.action === 'batch',
  )!;
  expect(batch.batchRoutes).toHaveLength(3);
  expect(actions.find((entry) => entry.module === 'batch')?.childScope).toBe(
    'caller-input-unknown',
  );
  const external = actions.find(
    (entry) =>
      entry.module === 'avatar_upload' && entry.action === 'imageUpload',
  )!;
  expect(external.samples[0]?.url).toContain(
    'https://nosup-hz1.127.net/yyimgs/',
  );
  expect(external.matches).toEqual([]);
});
