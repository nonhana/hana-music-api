import { initializeWatchman } from '../../../src/browser/watchman.ts';
import type {
  WatchmanClient,
  WatchmanOptions,
} from '../../../src/browser/watchman.ts';

const script: HTMLScriptElement = document.createElement('script');
const options: WatchmanOptions = { nonce: script.nonce, protocol: 'https' };
const pending: Promise<WatchmanClient> = initializeWatchman(options);
const client = await pending;
const value: Promise<string> = client.getToken();
void value;

// @ts-expect-error The browser project must not acquire Bun globals.
void Bun.version;
// @ts-expect-error The browser project must not acquire Node globals.
void process.pid;
// @ts-expect-error Standard DOM declarations must reject invalid element members.
void script.notARealScriptProperty;
