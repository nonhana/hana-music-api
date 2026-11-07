import { isRecord } from '../../src/core/utils.ts';

const redactedValue = '<redacted>';
const credentialKeyFragments = [
  'music_u',
  'music_a',
  'cookie',
  'token',
  'csrf',
  'password',
  'passwd',
  'secret',
  'captcha',
  'phone',
  'email',
] as const;
// tokenVersion 是数字版本号，不是凭据；只有精确等于这个名字才豁免。
const credentialKeyExceptions = new Set(['tokenVersion']);
const isCredentialKey = (key: string) => {
  if (credentialKeyExceptions.has(key)) return false;
  const lower = key.toLowerCase();
  return credentialKeyFragments.some((fragment) => lower.includes(fragment));
};
const credentialValue = /MUSIC_[UA]=|__csrf=/i;

/** 敏感 key 只整值替换非空字符串、数字和非空容器；null/空串/布尔/空容器保留类型证据。 */
const needsCredentialRedaction = (value: unknown): boolean => {
  if (typeof value === 'string') return value !== '';
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return false;
};

/**
 * 敏感 key 在任意深度命中，整个值（字符串/数字/布尔/对象/数组）都替换成 <redacted>，
 * 父节点敏感时不再深入；其他节点继续递归。path 相对录制文件（query.* / body.*）。
 */
export const redact = (
  value: unknown,
  path: string,
  redactedPaths: Array<string> = [],
  disabledFragments: ReadonlySet<string> = new Set(),
): unknown => {
  if (isRecord(value)) {
    const redacted: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const childPath = `${path}.${key}`;
      if (
        isCredentialKey(key) &&
        ![...disabledFragments].some((fragment) =>
          key.toLowerCase().includes(fragment),
        ) &&
        needsCredentialRedaction(item)
      ) {
        redactedPaths.push(childPath);
        redacted[key] = redactedValue;
        continue;
      }
      redacted[key] = redact(item, childPath, redactedPaths, disabledFragments);
    }
    return redacted;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      redact(item, `${path}[${index}]`, redactedPaths, disabledFragments),
    );
  }
  if (typeof value === 'string' && credentialValue.test(value)) {
    redactedPaths.push(path);
    return redactedValue;
  }
  return value;
};

/**
 * 写盘自检：对最终对象结构化递归，敏感 key 只能等于 <redacted>，任何字符串不能含
 * MUSIC_U=/MUSIC_A=/__csrf=。失败时调用方尚未动磁盘，因此不写新文件也不删旧录制。
 */
export const assertNoLeaks = (value: unknown, path: string): void => {
  if (typeof value === 'string') {
    if (credentialValue.test(value)) {
      throw new Error(`录制 ${path} 仍含未隐去的凭据，已停止写盘`);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      assertNoLeaks(item, `${path}[${index}]`);
    }
    return;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (
        isCredentialKey(key) &&
        item !== redactedValue &&
        item !== null &&
        item !== '' &&
        typeof item !== 'boolean' &&
        !(Array.isArray(item) && item.length === 0) &&
        !(isRecord(item) && Object.keys(item).length === 0)
      ) {
        throw new Error(`录制 ${path}.${key} 的敏感字段没有隐去，已停止写盘`);
      }
      assertNoLeaks(item, path.length === 0 ? key : `${path}.${key}`);
    }
  }
};
