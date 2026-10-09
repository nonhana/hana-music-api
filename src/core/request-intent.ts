import type { CreateRequestOptions, RequestIntent } from '../types/index.ts';
import { APP_CONF } from './config.ts';
import { requestSemantic } from './endpoint-policy.ts';

export const buildApiRequestIntent = (
  target: string,
  data: Record<string, unknown>,
  options: Pick<
    CreateRequestOptions,
    'crypto' | 'e_r' | 'acceptGzip' | 'headers' | 'ua'
  > = {},
): RequestIntent => ({
  target,
  protocol: options.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
  method: 'POST',
  headers: {
    ...options.headers,
    ...(options.ua ? { 'User-Agent': options.ua } : {}),
    ...(options.acceptGzip ? { 'x-aeapi': 'true' } : {}),
  },
  body: JSON.stringify({
    ...data,
    ...(options.e_r === undefined ? {} : { e_r: options.e_r }),
  }),
  response: 'json',
  semantic: requestSemantic(target),
});
