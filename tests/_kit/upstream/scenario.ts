import type { FetchLike } from '../../../src/types/index.ts';
import { readWireRequest } from './wire.ts';

export type WireRequest = Awaited<ReturnType<typeof readWireRequest>>;
export interface UpstreamExpectation {
  readonly url: string;
  readonly method: string;
  readonly headers?: Readonly<Record<string, string | null>>;
  readonly body?: string;
  readonly times?: number;
  readonly reject?: Error;
  readonly check?: (request: WireRequest) => void;
  readonly response: (request: WireRequest) => Response | Promise<Response>;
}

export const withScenario = async <Value>(
  expectations: ReadonlyArray<UpstreamExpectation>,
  work: (scenario: {
    fetcher: FetchLike;
    sent: Array<WireRequest>;
    entries: Array<{ input: string; aborted: boolean }>;
  }) => Promise<Value>,
  dispose: () => void | Promise<void> = () => {},
) => {
  const remaining = expectations.map((entry) => entry.times ?? 1);
  if (remaining.some((count) => !Number.isInteger(count) || count <= 0))
    throw new Error('Expectations require a finite positive count');
  const sent: Array<WireRequest> = [];
  const entries: Array<{ input: string; aborted: boolean }> = [];
  const failures: Array<Error> = [];
  const active = new Set<Promise<Response>>();
  const fetcher: FetchLike = (input, init) => {
    const attempt = {
      input: input instanceof Request ? input.url : String(input),
      aborted: false,
    };
    entries.push(attempt);
    const pending = (async () => {
      let expectedFailure: Error | undefined;
      let signal: AbortSignal | undefined;
      try {
        const wire = await readWireRequest(input, init);
        sent.push(wire);
        signal = wire.signal;
        if (wire.signal.aborted)
          throw new Error('Fake received an already cancelled request');
        const index = expectations.findIndex(
          (entry, position) =>
            remaining[position]! > 0 &&
            entry.url === wire.url &&
            entry.method === wire.method &&
            (entry.body === undefined || entry.body === wire.body) &&
            Object.entries(entry.headers ?? {}).every(
              ([name, value]) => wire.headers.get(name) === value,
            ),
        );
        if (index < 0)
          throw new Error(`Unexpected request: ${wire.method} ${wire.url}`);
        const expected = expectations[index]!;
        remaining[index]!--;
        expected.check?.(wire);
        if (expected.reject) {
          expectedFailure = expected.reject;
          throw expectedFailure;
        }
        const response = await expected.response(wire);
        if (wire.signal.aborted) {
          attempt.aborted = true;
          throw new Error('Fake response ignored cancellation');
        }
        return response;
      } catch (error) {
        const failure =
          error instanceof Error ? error : new Error(String(error));
        if (
          failure !== expectedFailure &&
          !(
            failure instanceof DOMException &&
            failure.name === 'AbortError' &&
            signal?.aborted
          )
        )
          failures.push(failure);
        throw failure;
      }
    })();
    active.add(pending);
    void pending.finally(() => active.delete(pending)).catch(() => undefined);
    return pending;
  };
  let value: Value | undefined;
  try {
    value = await work({ fetcher, sent, entries });
  } catch (error) {
    failures.push(error instanceof Error ? error : new Error(String(error)));
  } finally {
    try {
      await dispose();
    } catch (error) {
      failures.push(error instanceof Error ? error : new Error(String(error)));
    }
    if (active.size)
      failures.push(
        new Error(`Fake still has ${active.size} unfinished requests`),
      );
    for (const [index, count] of remaining.entries())
      if (count)
        failures.push(
          new Error(`Unconsumed expectation ${index}: ${count} request(s)`),
        );
  }
  if (failures.length)
    throw new AggregateError(
      failures,
      failures.map((error) => error.message).join('; '),
    );
  return value as Value;
};
