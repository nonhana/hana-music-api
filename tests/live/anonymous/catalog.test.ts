import { test } from 'bun:test';

import { installedLiveSession } from '../../_kit/live.ts';

const session = await installedLiveSession();
test(
  'anonymous catalog validates playlist IDs and the requested artist',
  () => session.catalog(),
  180000,
);
