import type { RequestIntent } from '../types/index.ts';
import { InvalidRequest } from './errors.ts';
import type { RequestAction } from './request-actions.ts';
import { requestProfiles } from './request-profiles.ts';

export const buildActionRequestIntent = (
  name: string,
  action: RequestAction,
  data: Record<string, unknown>,
  target?: string,
  headers: RequestIntent['headers'] = {},
): RequestIntent => {
  const path =
    target ?? (typeof action.target === 'string' ? action.target : undefined);
  if (!path) {
    throw InvalidRequest.make({
      message: `Request action ${name} needs a target`,
    });
  }
  return {
    action: name,
    target: path,
    protocol: requestProfiles[action.profile].protocol,
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    response: 'json',
    semantic: action.semantic,
  };
};

// plain 阶段沿用同一能力；方法和正文消费方式由动作声明固定。
export const buildPlainActionRequestIntent = (
  name: string,
  action: RequestAction & Required<Pick<RequestAction, 'method' | 'response'>>,
  target: string,
  options: Pick<RequestIntent, 'body' | 'headers'> = { headers: {} },
): RequestIntent => ({
  action: name,
  target,
  protocol: 'plain',
  method: action.method,
  response: action.response,
  headers: options.headers,
  ...(options.body === undefined ? {} : { body: options.body }),
  semantic: action.semantic,
});
