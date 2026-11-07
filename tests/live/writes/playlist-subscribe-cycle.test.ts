import { test } from 'bun:test';

import { installedLiveSession } from '../../_kit/live.ts';

const session = await installedLiveSession();
test(
  'authorized playlist is collected once and restored with confirmed confirmation',
  () => session.playlistCycle(),
  900000,
);
