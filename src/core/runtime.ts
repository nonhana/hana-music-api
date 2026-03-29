import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'

import type { RuntimeState } from '../types/index.ts'

import { generateDeviceId, generateRandomChineseIP } from './utils.ts'

export const DEFAULT_ANONYMOUS_TOKEN_PATH = resolve(tmpdir(), 'anonymous_token')

let runtimeState: RuntimeState = {
  anonymousToken: readAnonymousToken(DEFAULT_ANONYMOUS_TOKEN_PATH),
  cnIp: generateRandomChineseIP(),
  deviceId: generateDeviceId(),
}

export function getRuntimeState(overrides: Partial<RuntimeState> = {}): RuntimeState {
  return {
    ...runtimeState,
    ...overrides,
  }
}

export function setRuntimeState(nextState: Partial<RuntimeState>): RuntimeState {
  runtimeState = {
    ...runtimeState,
    ...nextState,
  }

  return runtimeState
}

export function readAnonymousToken(filePath = DEFAULT_ANONYMOUS_TOKEN_PATH): string {
  try {
    return readFileSync(filePath, 'utf8').trim()
  } catch {
    return ''
  }
}

export function writeAnonymousToken(token: string, filePath = DEFAULT_ANONYMOUS_TOKEN_PATH): void {
  mkdirSync(dirname(filePath), {
    recursive: true,
  })
  writeFileSync(filePath, token, 'utf8')
  setRuntimeState({
    anonymousToken: token,
  })
}
