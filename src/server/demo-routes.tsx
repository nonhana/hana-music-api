/** @jsxImportSource hono/jsx */

import type { Hono } from 'hono'

import { jsxRenderer } from 'hono/jsx-renderer'

import { apiDebugClientScript } from '../demo/client/api-debug.ts'
import { qrLoginClientScript } from '../demo/client/qr-login.ts'
import { searchClientScript } from '../demo/client/search.ts'
import { sharedClientScript } from '../demo/client/shared.ts'
import { uploadPlaylistCoverClientScript } from '../demo/client/upload-playlist-cover.ts'
import { DemoLayout } from '../demo/layouts/demo-layout.tsx'
import { ApiDebugPage } from '../demo/pages/api-debug.tsx'
import { DemoIndexPage } from '../demo/pages/demo-index.tsx'
import { DemoPlaceholderPage } from '../demo/pages/demo-placeholder.tsx'
import { QrLoginPage } from '../demo/pages/qr-login.tsx'
import { SearchPage } from '../demo/pages/search.tsx'
import { UploadPlaylistCoverPage } from '../demo/pages/upload-playlist-cover.tsx'
import { getDemoPageByPath, getGroupedDemoPages } from '../demo/registry.ts'
import { demoStyles } from '../demo/styles/demo.css.ts'

const clientScripts = {
  'api-debug.js': apiDebugClientScript,
  'qr-login.js': qrLoginClientScript,
  'search.js': searchClientScript,
  'shared.js': sharedClientScript,
  'upload-playlist-cover.js': uploadPlaylistCoverClientScript,
} as const

function isClientScriptAsset(asset: string): asset is keyof typeof clientScripts {
  return asset in clientScripts
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
    const page = getDemoPageByPath('/demo/experiments/audio-match')

    if (!page) {
      return context.notFound()
    }

    return context.render(<DemoPlaceholderPage page={page} />)
  })
}
