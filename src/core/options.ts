import { InvalidRequest } from './errors.ts';
import { isRecord } from './utils.ts';

export { createOption } from './option-builder.ts';

export const moduleConfigKeys = [
  'connectionStrategy',
  'cookie',
  'fetcher',
  'ip',
  'onRequestEvent',
  'realIP',
  'retry',
  'signal',
  'state',
  'timeoutMs',
  'checkToken',
] as const;

export const removedModuleConfigKeys = [
  'proxy',
  'crypto',
  'ua',
  'domain',
  'e_r',
  'acceptGzip',
  'headers',
  'deviceId',
] as const;

export const validateModuleConfig = (value: unknown, client = false): void => {
  if (!isRecord(value))
    throw InvalidRequest.make({ message: 'Module config must be an object' });
  const allowed: ReadonlyArray<string> = client
    ? [...moduleConfigKeys, 'cache', 'identityPool']
    : moduleConfigKeys;
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !allowed.includes(key)) {
      throw InvalidRequest.make({
        message: `Module execution option is not allowed: ${String(key)}`,
      });
    }
  }
};

export const validateModuleQuery = (value: unknown): void => {
  if (!isRecord(value)) return;
  for (const key of [
    ...moduleConfigKeys,
    ...removedModuleConfigKeys,
    'cache',
    'identityPool',
  ]) {
    if (Object.hasOwn(value, key))
      throw InvalidRequest.make({
        message: `Execution option belongs in config: ${key}`,
      });
  }
};

export const rejectRemovedRequestHandler = (options: object): void => {
  if ('requestHandler' in options) {
    throw new TypeError(
      'requestHandler is no longer supported; inject a fetcher instead',
    );
  }
};
