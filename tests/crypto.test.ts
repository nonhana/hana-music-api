import { describe, expect, test } from 'bun:test'
import { createCipheriv } from 'node:crypto'
import { gzipSync } from 'node:zlib'

import {
  aesDecrypt,
  aesEncrypt,
  eapi,
  eapiReqDecrypt,
  eapiResDecrypt,
  linuxapi,
  weapi,
} from '../src/core/crypto.ts'

const EAPI_KEY = 'e82ckenh8dichen8'
const IV = '0102030405060708'
const PRESET_KEY = '0CoJUm6Qyw8W8jud'
const LINUXAPI_KEY = 'rFgB&h#%2?^eDg:Q'

describe('crypto', () => {
  test('should create weapi payloads that can be decrypted with the fixed secret', () => {
    const payload = {
      hello: 'world',
    }
    const secretKey = '0123456789abcdef'
    const encrypted = weapi(payload, secretKey)
    const decryptedOuter = aesDecrypt(encrypted.params, 'cbc', secretKey, IV).toString('utf8')
    const decryptedInner = aesDecrypt(decryptedOuter, 'cbc', PRESET_KEY, IV).toString('utf8')

    expect(JSON.parse(decryptedInner)).toEqual(payload)
    expect(encrypted.encSecKey).toMatch(/^[0-9a-f]{256}$/)
  })

  test('should create linuxapi payloads with deterministic ECB encryption', () => {
    const payload = {
      method: 'POST',
      params: {
        id: '123',
      },
      url: 'https://music.163.com/api/test',
    }
    const encrypted = linuxapi(payload)
    const decrypted = aesDecrypt(encrypted.eparams, 'ecb', LINUXAPI_KEY, '', 'hex').toString('utf8')

    expect(JSON.parse(decrypted)).toEqual(payload)
  })

  test('should roundtrip eapi request payloads', () => {
    const payload = {
      hello: 'world',
      nested: {
        value: 1,
      },
    }
    const encrypted = eapi('/api/test', payload)
    const decrypted = eapiReqDecrypt(encrypted.params)

    expect(decrypted).toEqual({
      data: payload,
      url: '/api/test',
    })
  })

  test('should decrypt plain and gzipped eapi responses', () => {
    const plainPayload = {
      code: 200,
      ok: true,
    }
    const plainEncrypted = aesEncrypt(JSON.stringify(plainPayload), 'ecb', EAPI_KEY, '', 'hex')
    const zippedPayload = {
      code: 200,
      zipped: true,
    }
    const cipher = createCipheriv('aes-128-ecb', Buffer.from(EAPI_KEY, 'utf8'), null)
    cipher.setAutoPadding(true)
    const zippedEncrypted = Buffer.concat([
      cipher.update(gzipSync(JSON.stringify(zippedPayload))),
      cipher.final(),
    ])
      .toString('hex')
      .toUpperCase()

    expect(eapiResDecrypt(plainEncrypted)).toEqual(plainPayload)
    expect(eapiResDecrypt(zippedEncrypted, true)).toEqual(zippedPayload)
    expect(aesDecrypt(plainEncrypted, 'ecb', EAPI_KEY, '', 'hex')).toBeDefined()
  })
})
