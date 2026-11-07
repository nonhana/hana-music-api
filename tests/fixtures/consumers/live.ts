import { afterAll } from 'bun:test';
import { writeFile } from 'node:fs/promises';

import { installedLiveSession } from '../../_kit/live.ts';

const session = await installedLiveSession();
afterAll(async () => {
  const path = process.env.HANA_LIVE_SNAPSHOT;
  if (!path) throw new Error('missing sanitized live snapshot path');
  await writeFile(path, JSON.stringify(session.snapshot(), null, 2) + '\n');
});
