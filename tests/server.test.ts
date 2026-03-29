import { describe, expect, test } from 'bun:test'

import { createServer } from '../src/server/create-server.ts'

async function readJson(response: Response): Promise<unknown> {
  return response.json()
}

describe('createServer', () => {
  test('should expose the phase 0 baseline route', async () => {
    const app = createServer()
    const response = await app.request('/')
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      name: 'hana-music-api',
      phase: 0,
      ready: true,
      message: 'hana-music-api migration baseline is ready',
    })
  })

  test('should expose the health route', async () => {
    const app = createServer({
      serviceVersion: 'test-version',
    })
    const response = await app.request('/health')
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      ok: true,
      name: 'hana-music-api',
      version: 'test-version',
    })
  })
})
