import { expect } from 'bun:test';

import { Effect } from 'effect';

import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import type {
  ModuleCallConfig,
  ModuleEffect,
  ModuleQuery,
  RequestCapability,
  UnknownJson,
} from '../../src/types/index.ts';

export const songFile = {
  data: new Uint8Array([1, 2]),
  name: 'demo.mp3',
  size: 2,
  mimetype: 'audio/mpeg',
};
export const tokenBody = {
  code: 200,
  result: {
    token: 'nos-token',
    objectKey: 'voice/demo',
    docId: 'doc-1',
    resourceId: 'resource-1',
  },
};
export const initXml =
  '<InitiateMultipartUploadResult><UploadId>upload-123</UploadId></InitiateMultipartUploadResult>';
export const relatedHtml =
  '<div class="cver u-cover u-cover-3"><img src="cover?param=50y50"><a class="sname f-fs1 s-fc0" href="/playlist?id=1">List</a><a class="nm nm f-thide s-fc3" href="/user/home?id=2">User</a>';

export const response = (body: unknown, headers = new Headers()) => ({
  status: 200,
  cookie: [],
  headers,
  body: body as UnknownJson,
});

export const executeModule = (
  implementation: unknown,
  input: ModuleQuery,
  request: RequestCapability,
  config: ModuleCallConfig = {},
  deadlineAt?: number,
) => {
  const result: unknown = Reflect.apply(
    implementation as (...args: Array<unknown>) => unknown,
    undefined,
    [input, request],
  );
  if (result instanceof Promise) {
    void result.catch(() => undefined);
  }
  expect(Effect.isEffect(result)).toBe(true);
  const call: CallShape = {
    identifier: 'upload-test',
    input,
    config,
    identity: resolveIdentitySnapshot(config, getRuntimeState()),
    startedAt: 0,
    deadlineAt,
    policy: { read: false, upload: true, stageTimeoutMs: 60_000 },
  };
  // Pre-build the Context once and provideService it (rather than providing the layer per run):
  // layer values are captured at build time, and a pre-built Context survives fiber scope
  // closing between provide and run.
  return (result as ReturnType<ModuleEffect<ModuleQuery>>).pipe(
    Effect.provideService(Call, call),
  );
};
