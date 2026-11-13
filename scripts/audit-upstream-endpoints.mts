import { requestProfiles } from '../src/core/request-profiles.ts';
import { sdkModuleRegistry } from '../src/sdk/generated/registry.generated.ts';
import baseline from '../tests/fixtures/upstream-policy/baseline-actions-472dbc5.json';
import dynamicSamples from '../tests/fixtures/upstream-policy/dynamic-samples.json';
import migration from '../tests/fixtures/upstream-policy/web-migration-2026-11.json';
import snapshot from '../tests/fixtures/upstream-policy/yidun-web-2026-11-13.json';

const rules = snapshot.data['yidun#paths'].whiteList;

// Mirrors the observed webpage's trailing-slash removal and ordered rule selection.
export const matchRules = (target: string, entries = rules) => {
  const url = new URL(target, 'https://music.163.com');
  if (
    url.protocol !== 'https:' ||
    !['music.163.com', 'interface.music.163.com'].includes(url.hostname) ||
    url.port ||
    url.username ||
    url.password
  )
    return [];
  const path = url.pathname.replace(/\/$/, '');
  return entries.flatMap((rule, index) =>
    rule.list.some((pattern) =>
      pattern.endsWith('/') ? path.startsWith(pattern) : path === pattern,
    )
      ? [{ index, businessId: rule.businessId }]
      : [],
  );
};

export const audit = () => {
  const actions = Object.entries(sdkModuleRegistry).flatMap(([module, entry]) =>
    Object.entries(entry.actions).map(([action, contract]) => {
      const profile = requestProfiles[contract.profile];
      const logicalTarget =
        typeof contract.target === 'string'
          ? contract.target
          : contract.target.prefix;
      const samples =
        typeof contract.target === 'string'
          ? []
          : (
              dynamicSamples.actions.find(
                (sampleAction) =>
                  sampleAction.module === module &&
                  sampleAction.action === action,
              )?.samples ?? []
            ).map((sample) => {
              const matches = matchRules(sample.url);
              return {
                ...sample,
                matches,
                businessId: matches.at(-1)?.businessId ?? null,
              };
            });
      const matches =
        typeof contract.target === 'string'
          ? matchRules(new URL(logicalTarget, profile.domain).href)
          : (samples[0]?.matches ?? null);
      return {
        module,
        action,
        ...contract,
        protocol: profile.protocol,
        domain: profile.domain,
        kind:
          typeof contract.target !== 'string'
            ? 'dynamic'
            : logicalTarget === '/api/batch'
              ? 'batch'
              : 'fixed',
        matches,
        batchRoutes:
          module === 'playlist_update' && action === 'batch'
            ? migration.batchObjectRoutes.map((path) => ({
                path,
                matches: matchRules(path),
                source: migration.source,
              }))
            : null,
        childScope:
          logicalTarget === '/api/batch'
            ? module === 'playlist_update'
              ? 'fixed-children'
              : 'caller-input-unknown'
            : null,
        matchScope:
          typeof contract.target === 'string'
            ? 'fixed'
            : samples.length
              ? 'representative-only'
              : 'unknown',
        samples,
        businessId: matches?.at(-1)?.businessId ?? null,
      };
    }),
  );
  return { modules: Object.keys(sdkModuleRegistry).length, actions };
};

const key = (entry: { module: string; action: string }) =>
  `${entry.module}.${entry.action}`;

export const checkCoverage = (
  actual = audit().actions,
  dispositions = migration.eapiDispositions,
) => {
  const errors: Array<string> = [];
  const baselineEapi = baseline.filter((entry) =>
    ['eapi', 'clientlogOsx'].includes(entry.profile),
  );
  for (const entry of baselineEapi) {
    const count = dispositions.filter((row) => key(row) === key(entry)).length;
    if (count !== 1) errors.push(`${key(entry)}: ${count} dispositions`);
  }
  for (const entry of dispositions)
    if (!baselineEapi.some((row) => key(row) === key(entry)))
      errors.push(`Unknown disposition: ${key(entry)}`);
  const expected = baseline.map((entry) => {
    const change = migration.changes.find((row) => key(row) === key(entry));
    return { ...entry, ...change };
  });
  const banner = baseline.find((entry) => entry.module === 'banner')!;
  expected.push({ ...banner, action: 'readPc', profile: 'web' });
  for (const entry of expected) {
    const found = actual.filter((row) => key(row) === key(entry));
    if (found.length !== 1) {
      errors.push(`${key(entry)}: ${found.length} actions`);
      continue;
    }
    for (const field of [
      'profile',
      'target',
      'semantic',
      'cache',
      'retry',
      'method',
      'response',
    ] as const)
      if (JSON.stringify(found[0]![field]) !== JSON.stringify(entry[field]))
        errors.push(`${key(entry)}: unexpected ${field}`);
  }
  for (const entry of actual)
    if (!expected.some((row) => key(row) === key(entry)))
      errors.push(`Unclassified action: ${key(entry)}`);
  return errors;
};

if (import.meta.main) {
  const result = audit();
  const errors = checkCoverage(result.actions);
  console.log(
    JSON.stringify(
      {
        source: migration.source,
        baselineHead: migration.baselineHead,
        rules: rules.length,
        pathOccurrences: rules.reduce(
          (total, rule) => total + rule.list.length,
          0,
        ),
        uniquePaths: new Set(rules.flatMap((rule) => rule.list)).size,
        ...result,
        errors,
        aliases: [
          { old: '/api/radio/like', current: '/api/song/like' },
          {
            old: '/api/resource/comments/reply',
            current: '/api/v1/resource/comments/reply',
          },
        ],
      },
      null,
      2,
    ),
  );
  if (errors.length) process.exitCode = 1;
}
