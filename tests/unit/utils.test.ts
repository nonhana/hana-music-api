import { describe, expect, spyOn, test } from 'bun:test';

import { generateDeviceId } from '../../index.ts';
import { stableStringify } from '../../src/core/utils.ts';

describe('generateDeviceId', () => {
  test('skips candidates whose anonymous digest contains plus or slash', () => {
    const candidates = [
      `${'0'.repeat(51)}1`,
      `${'0'.repeat(51)}3`,
      `${'0'.repeat(51)}2`,
    ];
    const digits = candidates.join('');
    let offset = 0;
    const random = spyOn(Math, 'random').mockImplementation(() => {
      const digit = digits[offset];
      offset += 1;
      if (digit === undefined) {
        throw new Error('No more device ID candidates');
      }
      return Number.parseInt(digit, 16) / 16;
    });
    try {
      expect(generateDeviceId()).toBe(candidates[2]!);
    } finally {
      random.mockRestore();
    }
  });
});

describe('stableStringify', () => {
  test('should produce key-order-independent output for objects', () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(
      stableStringify({ b: 2, a: 1 }),
    );
  });

  test('should serialize nested arrays and records deterministically', () => {
    expect(stableStringify({ list: [{ y: 2, x: 1 }] })).toBe(
      '{"list":[{"x":1,"y":2}]}',
    );
  });

  test('should encode File by name/size/type', () => {
    const file = new File(['abc'], 'a.txt', { type: 'text/plain' });
    // Bun adds charset info to File.type automatically
    expect(stableStringify(file)).toBe(
      'File(a.txt:3:text/plain;charset=utf-8)',
    );
  });
});
