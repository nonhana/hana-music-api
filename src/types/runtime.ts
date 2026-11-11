import type { Effect } from 'effect';

import type { Call } from '../core/call-context.ts';
import type {
  ModuleError,
  ModuleInputError,
  RequestError,
} from '../core/errors.ts';
import type { ModuleActions, RequestAction } from '../core/request-actions.ts';
import type { RequestServices } from '../core/request.ts';
import type { UnknownJson } from './unknown.ts';
import type { LegacyResponseBody, UpstreamResponse } from './upstream.ts';

export type RequestCrypto = '' | 'api' | 'eapi' | 'linuxapi' | 'weapi';

export type BooleanLike = boolean | number | string;

export type CookieValue = boolean | number | string;

export type CookieRecord = Record<string, CookieValue | undefined>;

export type FetchLike = (
  input: Request | URL | string,
  init?: RequestInit,
) => Promise<Response>;

export type ModuleQuery = Record<string, unknown>;

export interface RuntimeState {
  readonly anonymousToken: string;
  readonly cnIp: string;
  readonly deviceId: string;
}

export type RequestProtocol = 'api' | 'weapi' | 'eapi' | 'linuxapi' | 'plain';
export type RequestSemantic = 'read' | 'write' | 'login' | 'upload' | 'poll';

export interface ModuleResponse<Body = UnknownJson> {
  body: Body;
  cookie: Array<string>;
  status: number;
}

export type NcmApiResponse<TBody = LegacyResponseBody> = ModuleResponse<TBody>;

type ApiArguments<Target> = Target extends string
  ? {
      readonly data: Record<string, unknown>;
      readonly headers?: Readonly<Record<string, string>>;
      readonly path?: never;
      readonly target?: never;
      readonly query?: never;
      readonly body?: never;
    }
  : {
      readonly data: Record<string, unknown>;
      readonly headers?: Readonly<Record<string, string>>;
      readonly path: string;
      readonly target?: never;
      readonly query?: never;
      readonly body?: never;
    };
type PlainArguments<Target> = Target extends string
  ? {
      readonly query?: string;
      readonly headers?: Readonly<Record<string, string>>;
      readonly body?: Uint8Array | string;
      readonly target?: never;
      readonly data?: never;
      readonly path?: never;
    }
  : {
      readonly target: string;
      readonly headers?: Readonly<Record<string, string>>;
      readonly body?: Uint8Array | string;
      readonly query?: never;
      readonly data?: never;
      readonly path?: never;
    };
type DeclaredArguments<Action extends RequestAction> = {
  [Profile in Action['profile']]: Profile extends
    | 'plainMusic'
    | 'plainInterface'
    | 'plainImage'
    | 'plainVoice'
    | 'plainNos'
    | 'plainLookup'
    ? PlainArguments<Action['target']>
    : ApiArguments<Action['target']>;
}[Action['profile']];
type BusinessArguments =
  | {
      readonly data: Record<string, unknown>;
      readonly headers?: Readonly<Record<string, string>>;
      readonly path?: string;
      readonly target?: never;
      readonly query?: never;
      readonly body?: never;
    }
  | {
      readonly headers?: Readonly<Record<string, string>>;
      readonly target?: string;
      readonly query?: string;
      readonly body?: Uint8Array | string;
      readonly data?: never;
      readonly path?: never;
    };
// 默认注册表可包含 API/plain；模块自身的具体动作表仍按声明限制参数。
export type RequestArguments<Action extends RequestAction> = BusinessArguments &
  (RequestAction extends Action ? unknown : DeclaredArguments<Action>);
export type RequestCapability<Actions extends ModuleActions = ModuleActions> = <
  Name extends keyof Actions & string,
  Args extends RequestArguments<Actions[Name]>,
>(
  name: Name,
  args: Args &
    Record<Exclude<keyof Args, keyof RequestArguments<Actions[Name]>>, never>,
) => Effect.Effect<UpstreamResponse, RequestError, ModuleServices>;

export type ModuleServices = RequestServices | Call;

export type ModuleEffect<
  Input,
  Body = UnknownJson,
  Actions extends ModuleActions = ModuleActions,
> = (
  input: Input,
  request: RequestCapability<Actions>,
) => Effect.Effect<
  ModuleResponse<Body>,
  ModuleInputError | ModuleError | RequestError,
  ModuleServices
>;

export interface ModuleDefinition<
  Identifier extends string = string,
  Input = Readonly<Record<string, unknown>>,
  Body = UnknownJson,
  Actions extends ModuleActions = ModuleActions,
> {
  readonly identifier: Identifier;
  readonly actions: Actions;
  readonly route: string;
  readonly decodeInput: (
    input: unknown,
  ) => Effect.Effect<Input, ModuleInputError>;
  readonly execute: ModuleEffect<Input, Body, Actions>;
}
