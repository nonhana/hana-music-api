import { test } from 'bun:test';

import { installedLiveSession } from '../../_kit/live.ts';

const session = await installedLiveSession();
test(
  'authenticated loginStatus.data matches the current expected identity',
  () => session.account(),
  180000,
);
