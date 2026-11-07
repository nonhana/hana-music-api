import { installOfflineGuard } from '../../_kit/upstream/offline.ts';

const network = installOfflineGuard();
process.once('beforeExit', () => network.verify());
process.once('exit', () => network.dispose());
