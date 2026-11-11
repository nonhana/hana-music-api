import { createHanaMusicApi } from '../../index.ts';
import type { HanaMusicApiClient } from '../../src/sdk/generated/client.generated.ts';

// 回放只验证响应解码与公开返回，不匹配请求，也不证明当次真实上游。
// 录制保留旧协议 query，输入在这里放宽为 unknown；新输入契约由 contract/编码/包类型用例验证。
export type ReplayClient = {
  readonly [
    Method in keyof HanaMusicApiClient
  ]: HanaMusicApiClient[Method] extends (
    ...arguments_: Array<never>
  ) => infer Result
    ? (
        input?: unknown,
        config?: Parameters<HanaMusicApiClient[Method]>[1],
      ) => Result
    : never;
};

export const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  }) as unknown as ReplayClient;

// 非 JSON 正文（如空字符串）的录制：直接回放原始文本，状态码原样保留。
export const replayRaw = (body: string, status: number) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => new Response(body, { status }),
  }) as unknown as ReplayClient;
