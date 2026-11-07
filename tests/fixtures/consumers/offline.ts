import { afterAll } from 'bun:test';

import { installOfflineGuard } from '../../_kit/upstream/offline.ts';

const network = installOfflineGuard();
afterAll(() => {
  try {
    network.verify();
  } finally {
    network.dispose();
  }
});
