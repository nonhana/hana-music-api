import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { projectRoot } from '../../_kit/assertions.ts';

test.each([
  'matching tree',
  'different tree',
  'different pull request',
  'different merge',
  'failed verify',
  'skipped inventory',
  'missing job',
  'API unavailable',
])('post-merge verify lookup: %s', async (scenario) => {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim();
  const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim();
  const directory = await mkdtemp(resolve(tmpdir(), 'hana-verify-reuse-'));
  const output = resolve(directory, 'output');
  await Bun.write(output, '');
  const repo = { full_name: 'example/sdk' };
  const head = 'a'.repeat(40);
  const step = `Verify test inventory (pull_request ${scenario === 'different pull request' ? 99 : 10} / ${scenario === 'different tree' ? 'b'.repeat(40) : tree})`;
  const server = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch(request) {
      const { pathname, search } = new URL(request.url);
      const path = pathname.replace('/repos/example/sdk/', '') + search;
      if (scenario === 'API unavailable')
        return new Response('unavailable', { status: 503 });
      if (path === `commits/${commit}/pulls`)
        return Response.json([
          {
            number: 10,
            merged_at: '2026-01-01',
            merge_commit_sha: scenario === 'different merge' ? head : commit,
            base: { ref: 'master', repo },
            head: { sha: head, repo },
          },
        ]);
      if (
        path ===
        `actions/workflows/verify.yml/runs?event=pull_request&head_sha=${head}&per_page=1`
      )
        return Response.json({
          workflow_runs: [
            {
              id: 81,
              run_attempt: 2,
              head_sha: head,
              head_repository: repo,
              event: 'pull_request',
              path: '.github/workflows/verify.yml',
              conclusion: scenario === 'failed verify' ? 'failure' : 'success',
            },
          ],
        });
      if (path === 'actions/runs/81/attempts/2/jobs?per_page=100')
        return Response.json({
          jobs:
            scenario === 'missing job'
              ? []
              : [
                  {
                    name: 'verify',
                    conclusion: 'success',
                    steps: [
                      {
                        name: step,
                        conclusion:
                          scenario === 'skipped inventory'
                            ? 'skipped'
                            : 'success',
                      },
                    ],
                  },
                ],
        });
      return new Response('unexpected lookup', { status: 404 });
    },
  });
  try {
    const processResult = Bun.spawn(
      [process.execPath, 'scripts/find-pr-verify.mts'],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          GITHUB_API_URL: server.url.origin,
          GITHUB_SERVER_URL: 'https://github.com',
          GITHUB_SHA: commit,
          GITHUB_REPOSITORY: repo.full_name,
          GH_TOKEN: 'test',
          GITHUB_OUTPUT: output,
          GITHUB_STEP_SUMMARY: resolve(directory, 'summary'),
        },
        stdout: 'pipe',
        stderr: 'pipe',
      },
    );
    expect(await processResult.exited).toBe(0);
    expect(await Bun.file(output).text()).toBe(
      scenario === 'matching tree' ? 'run_id=81\n' : '',
    );
  } finally {
    await server.stop(true);
    await rm(directory, { recursive: true, force: true });
  }
});
