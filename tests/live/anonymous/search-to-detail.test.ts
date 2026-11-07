import { test } from 'bun:test';

import { installedLiveSession } from '../../_kit/live.ts';

const session = await installedLiveSession();
test(
  'anonymous search derives the exact detail and lyric input',
  () => session.searchToDetail(),
  180000,
);
