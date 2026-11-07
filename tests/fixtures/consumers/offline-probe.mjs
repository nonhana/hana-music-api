import { rejects, strictEqual } from 'node:assert';

import { fetch as undiciFetch } from 'undici';

import { installOfflineGuard } from '../../_kit/upstream/offline.ts';

const network = installOfflineGuard();
try {
  await rejects(fetch('https://external.invalid/probe'), /Offline guard/);
  await rejects(undiciFetch('https://external.invalid/probe'));
  strictEqual(network.rejected.length, 2);
  process.stdout.write(JSON.stringify({ rejected: network.rejected.length }));
} finally {
  network.dispose();
}
