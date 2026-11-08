import type { FetchLike, NcmApiResponse } from '../../../src/types/index.ts';
import { withScenario } from './scenario.ts';
import { readEapiBody, readWebBody } from './wire.ts';

export interface ApiWireRequest {
  readonly path: string;
  readonly data: Record<string, unknown>;
  readonly url: string;
  readonly method: string;
  readonly crypto: 'api' | 'eapi' | 'weapi';
  readonly headers: Readonly<Record<string, string>>;
  readonly cookie: Record<string, string>;
  readonly ip: string | undefined;
  readonly signal: AbortSignal;
}

export type ApiWireMetadata = Omit<ApiWireRequest, 'path' | 'data'>;

export const withApiScenario = <Value>(
  targets: ReadonlyArray<string>,
  respond: (
    request: ApiWireRequest,
  ) => NcmApiResponse | Promise<NcmApiResponse>,
  work: (fetcher: FetchLike) => Promise<Value>,
) =>
  withScenario(
    targets.map((url) => ({
      url,
      method: 'POST',
      response: async (wire) => {
        const pathname = new URL(wire.url).pathname;
        let path = pathname;
        let crypto: ApiWireRequest['crypto'];
        let decoded: unknown;
        if (pathname.startsWith('/eapi/')) {
          const envelope = readEapiBody(wire.body);
          crypto = 'eapi';
          path = envelope.path;
          decoded = envelope.data;
        } else if (pathname.startsWith('/weapi/')) {
          crypto = 'weapi';
          path = '/api/' + pathname.slice(7);
          decoded = readWebBody(wire.body);
        } else if (pathname.startsWith('/api/')) {
          crypto = 'api';
          decoded = Object.fromEntries(new URLSearchParams(wire.body));
        } else {
          throw new Error(`Unexpected API protocol: ${wire.url}`);
        }
        if (
          typeof decoded !== 'object' ||
          decoded === null ||
          Array.isArray(decoded)
        )
          throw new Error('Expected API object payload');
        const data: Record<string, unknown> = Object.fromEntries(
          Object.entries(decoded),
        );
        if (crypto === 'eapi') delete data.header;
        delete data.e_r;
        if (crypto === 'weapi') delete data.csrf_token;
        const cookie = Object.fromEntries(
          (wire.headers.get('cookie') ?? '')
            .split(';')
            .filter(Boolean)
            .map((entry) => {
              const position = entry.indexOf('=');
              if (position < 0) throw new Error('Invalid Cookie pair');
              return [
                entry.slice(0, position).trim(),
                decodeURIComponent(entry.slice(position + 1)),
              ];
            }),
        );
        const response = await respond({
          path,
          data,
          crypto,
          cookie,
          url: wire.url,
          method: wire.method,
          headers: Object.fromEntries(wire.headers),
          ip: wire.headers.get('x-real-ip') ?? undefined,
          signal: wire.signal,
        });
        const headers = new Headers();
        for (const value of response.cookie)
          headers.append('Set-Cookie', value);
        return Response.json(response.body, {
          status: response.status,
          headers,
        });
      },
    })),
    (scenario) => work(scenario.fetcher),
  );
