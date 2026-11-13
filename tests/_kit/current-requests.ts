import deltas from '../fixtures/upstream-policy/current-request-deltas.json';

// Independent issue-approved differences overlay historical evidence without relabeling its origin.
export const currentRequests = <
  Baseline extends { cases: Array<{ module: string; label: string }> },
>(
  group: keyof typeof deltas.groups,
  baseline: Baseline,
): Baseline => ({
  ...baseline,
  cases: baseline.cases.map((entry) => ({
    ...entry,
    ...deltas.groups[group].find(
      (change) =>
        change.module === entry.module && change.label === entry.label,
    ),
  })),
});
