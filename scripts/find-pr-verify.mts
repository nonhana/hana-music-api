import { execFileSync } from 'node:child_process';
import { appendFile } from 'node:fs/promises';

interface Repository {
  full_name: string;
}
interface PullRequest {
  number: number;
  merged_at: string | null;
  merge_commit_sha: string | null;
  base: { ref: string; repo: Repository };
  head: { sha: string; repo: Repository | null };
}
interface VerifyRun {
  id: number;
  run_attempt: number;
  head_sha: string;
  head_repository: Repository | null;
  event: string;
  path: string;
  conclusion: string | null;
}
interface Job {
  name: string;
  conclusion: string | null;
  steps: Array<{ name: string; conclusion: string | null }>;
}

const findVerifiedRun = async (
  repository: string,
  commit: string,
  tree: string,
  read: (path: string) => Promise<unknown>,
) => {
  const pulls = (await read(`commits/${commit}/pulls`)) as Array<PullRequest>;
  const merged = pulls.filter(
    (pr) =>
      pr.merged_at &&
      pr.merge_commit_sha === commit &&
      pr.base.ref === 'master' &&
      pr.base.repo.full_name === repository,
  );
  if (merged.length !== 1) return undefined;
  const pr = merged[0]!;
  const {
    workflow_runs: [run],
  } = (await read(
    `actions/workflows/verify.yml/runs?event=pull_request&head_sha=${pr.head.sha}&per_page=1`,
  )) as { workflow_runs: Array<VerifyRun> };
  // An older successful attempt must never hide a failed or pending rerun.
  if (
    !run ||
    run.conclusion !== 'success' ||
    run.event !== 'pull_request' ||
    run.path !== '.github/workflows/verify.yml' ||
    run.head_sha !== pr.head.sha ||
    !pr.head.repo ||
    run.head_repository?.full_name !== pr.head.repo.full_name
  )
    return undefined;
  const { jobs } = (await read(
    `actions/runs/${run.id}/attempts/${run.run_attempt}/jobs?per_page=100`,
  )) as { jobs: Array<Job> };
  const proof = `Verify test inventory (pull_request ${pr.number} / ${tree})`;
  if (
    jobs.some(
      (job) =>
        job.name === 'verify' &&
        job.conclusion === 'success' &&
        job.steps.some(
          (step) => step.name === proof && step.conclusion === 'success',
        ),
    )
  )
    return run.id;
  return undefined;
};

if (import.meta.main) {
  const repository = process.env.GITHUB_REPOSITORY!;
  const commit = process.env.GITHUB_SHA!;
  let run: number | undefined;
  try {
    const tree = execFileSync('git', ['rev-parse', `${commit}^{tree}`], {
      encoding: 'utf8',
    }).trim();
    run = await findVerifiedRun(repository, commit, tree, async (path) => {
      const response = await fetch(
        `${process.env.GITHUB_API_URL}/repos/${repository}/${path}`,
        {
          headers: { authorization: `Bearer ${process.env.GH_TOKEN}` },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok)
        throw new Error(`GitHub returned HTTP ${response.status}`);
      return response.json();
    });
  } catch (error) {
    console.warn(
      'PR verification lookup unavailable:',
      error instanceof Error ? error.message : 'unknown response',
    );
  }
  const message = run
    ? `Reusing successful PR verify: ${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${run}`
    : 'No matching successful PR verify. Running the full checks.';
  console.log(message);
  await appendFile(process.env.GITHUB_STEP_SUMMARY!, message + '\n');
  if (run) await appendFile(process.env.GITHUB_OUTPUT!, `run_id=${run}\n`);
}
