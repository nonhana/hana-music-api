import { createDecipheriv } from 'node:crypto';

export const readWireRequest = async (
  input: Request | URL | string,
  init?: RequestInit,
) => {
  // Bun and Node declarations disagree about clone() extras; runtime cloning preserves the standard Request.
  const request =
    input instanceof Request
      ? new Request(input.clone() as Request, init)
      : new Request(String(input), init);
  return {
    request,
    url: request.url,
    method: request.method,
    headers: request.headers,
    body: await request.clone().text(),
    signal: request.signal,
  };
};

// The two AES rounds and constants are decoded independently of production request/profile code.
export const readWebBody = (
  body: string,
  secret = 'aaaaaaaaaaaaaaaa',
): unknown => {
  let value = new URLSearchParams(body).get('params');
  if (!value) throw new Error('Missing encrypted web body');
  for (const key of [secret, '0CoJUm6Qyw8W8jud']) {
    const decipher = createDecipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      Buffer.from('0102030405060708'),
    );
    value = Buffer.concat([
      decipher.update(Buffer.from(value, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
  return JSON.parse(value);
};
