import { describe, expect, test } from 'bun:test'

import { stableStringify } from '../src/core/utils.ts'

describe('stableStringify', () => {
  test('should produce key-order-independent output for objects', () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }))
  })

  test('should serialize nested arrays and records deterministically', () => {
    expect(stableStringify({ list: [{ y: 2, x: 1 }] })).toBe('{list:[{x:1,y:2}]}')
  })

  test('should encode File by name/size/type', () => {
    const file = new File(['abc'], 'a.txt', { type: 'text/plain' })
    // Bun adds charset info to File.type automatically
    expect(stableStringify(file)).toBe('File(a.txt:3:text/plain;charset=utf-8)')
  })
})
