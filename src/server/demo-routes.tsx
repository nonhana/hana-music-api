import type { Hono } from 'hono'

import { jsxRenderer } from 'hono/jsx-renderer'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { apiDebugClientScript } from '../demo/client/api-debug.ts'
import { audioMatchClientScript } from '../demo/client/audio-match.ts'
import { qrLoginClientScript } from '../demo/client/qr-login.ts'
import { searchClientScript } from '../demo/client/search.ts'
import { sharedClientScript } from '../demo/client/shared.ts'
import { uploadPlaylistCoverClientScript } from '../demo/client/upload-playlist-cover.ts'
import { DemoLayout } from '../demo/layouts/demo-layout.tsx'
import { ApiDebugPage } from '../demo/pages/api-debug.tsx'
import { AudioMatchPage } from '../demo/pages/audio-match.tsx'
import { DemoIndexPage } from '../demo/pages/demo-index.tsx'
import { QrLoginPage } from '../demo/pages/qr-login.tsx'
import { SearchPage } from '../demo/pages/search.tsx'
import { UploadPlaylistCoverPage } from '../demo/pages/upload-playlist-cover.tsx'
import { getDemoPageByPath, getGroupedDemoPages } from '../demo/registry.ts'
import { demoStyles } from '../demo/styles/demo.css.ts'

const clientScripts = {
  'api-debug.js': apiDebugClientScript,
  'audio-match.js': audioMatchClientScript,
  'qr-login.js': qrLoginClientScript,
  'search.js': searchClientScript,
  'shared.js': sharedClientScript,
  'upload-playlist-cover.js': uploadPlaylistCoverClientScript,
} as const

const AUDIO_MATCH_ASSET_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../demo/assets/audio-match',
)

const audioMatchAssets = {
  'afp.js': {
    contentType: 'text/javascript; charset=utf-8',
    path: resolve(AUDIO_MATCH_ASSET_DIRECTORY, 'afp.js'),
  },
  'afp.wasm': {
    contentType: 'application/wasm',
    path: resolve(AUDIO_MATCH_ASSET_DIRECTORY, 'afp.wasm'),
  },
  'rec.js': {
    contentType: 'text/javascript; charset=utf-8',
    path: resolve(AUDIO_MATCH_ASSET_DIRECTORY, 'rec.js'),
  },
} as const

function isClientScriptAsset(asset: string): asset is keyof typeof clientScripts {
  return asset in clientScripts
}

function isAudioMatchAsset(asset: string): asset is keyof typeof audioMatchAssets {
  return asset in audioMatchAssets
}

export function registerDemoRoutes(app: Hono): void {
  const renderer = jsxRenderer(({ children }, context) => {
    const page = getDemoPageByPath(context.req.path)

    return (
      <DemoLayout currentPath={context.req.path} page={page}>
        {children}
      </DemoLayout>
    )
  })

  app.use('/demo', renderer)
  app.use('/demo/*', renderer)

  app.get('/demo/styles.css', (context) => {
    return context.body(demoStyles, 200, {
      'Content-Type': 'text/css; charset=utf-8',
    })
  })

  app.get('/demo/client/:asset', (context) => {
    const asset = context.req.param('asset')

    if (!isClientScriptAsset(asset)) {
      return context.notFound()
    }

    const script = clientScripts[asset]

    return context.body(script, 200, {
      'Content-Type': 'text/javascript; charset=utf-8',
    })
  })

  app.get('/demo/assets/audio-match/:asset', (context) => {
    const asset = context.req.param('asset')

    if (!isAudioMatchAsset(asset)) {
      return context.notFound()
    }

    const resource = audioMatchAssets[asset]

    return new Response(Bun.file(resource.path), {
      headers: {
        'Content-Type': resource.contentType,
      },
      status: 200,
    })
  })

  app.get('/demo', (context) => {
    return context.render(<DemoIndexPage groups={getGroupedDemoPages()} />)
  })

  app.get('/demo/api-debug', (context) => {
    return context.render(<ApiDebugPage />)
  })

  app.get('/demo/search', (context) => {
    return context.render(<SearchPage />)
  })

  app.get('/demo/qr-login', (context) => {
    return context.render(<QrLoginPage />)
  })

  app.get('/demo/upload/playlist-cover', (context) => {
    return context.render(<UploadPlaylistCoverPage />)
  })

  app.get('/demo/experiments/audio-match', (context) => {
    return context.render(<AudioMatchPage />)
  })
}
