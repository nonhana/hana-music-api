import { createHanaMusicApi } from '../../index.ts';

// 回放只验证响应解码与公开返回，不匹配请求，也不证明当次真实上游。
export const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

// 非 JSON 正文（如空字符串）的录制：直接回放原始文本，状态码原样保留。
export const replayRaw = (body: string, status: number) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => new Response(body, { status }),
  });
