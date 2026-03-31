/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

const API_DEBUG_SAMPLE = `{
  "cp": false,
  "id": "2058263032",
  "kv": 0,
  "lv": 0,
  "rv": 0,
  "tv": 0,
  "yrv": 0,
  "ytv": 0,
  "yv": 0
}`

export const ApiDebugPage: FC = () => {
  return (
    <>
      <PageHeader
        description="保留旧 `api.html` 的直接请求能力，但改成更适合阅读和粘贴 JSON 的双栏表单。"
        eyebrow="Request Debug"
        title="API Debug"
      />

      <div class="two-column-grid">
        <Surface
          description="通过 `/api` 模块直接调用任意上游接口，适合快速验证 `uri`、`crypto` 和原始 payload。"
          title="Request Builder"
        >
          <form class="stack-form" id="api-debug-form">
            <label class="field">
              <span>URI</span>
              <input id="api-uri" name="uri" type="text" value="/api/song/lyric/v1" />
            </label>

            <label class="field">
              <span>Crypto</span>
              <select id="api-crypto" name="crypto">
                <option value="">(默认)</option>
                <option value="weapi">weapi</option>
                <option value="eapi">eapi</option>
                <option value="api">api</option>
                <option value="linuxapi">linuxapi</option>
              </select>
            </label>

            <label class="field">
              <span>JSON Data</span>
              <textarea id="api-data" name="data" rows={14}>
                {API_DEBUG_SAMPLE}
              </textarea>
            </label>

            <div class="action-row">
              <button class="primary-button" type="submit">
                发送请求
              </button>
              <p class="inline-note" id="api-feedback">
                结果会显示在右侧面板。
              </p>
            </div>
          </form>
        </Surface>

        <Surface
          description="显示提交时的请求摘要和接口返回，便于直接复制到 issue、文档或测试里。"
          title="Response"
        >
          <div class="result-stack">
            <div>
              <h3 class="panel-heading">Request Snapshot</h3>
              <pre class="result-panel" id="api-request-preview">
                等待发送请求
              </pre>
            </div>
            <div>
              <h3 class="panel-heading">Raw Response</h3>
              <pre class="result-panel" id="api-result">
                等待返回结果
              </pre>
            </div>
          </div>
        </Surface>
      </div>

      <script src="/demo/client/api-debug.js" type="module"></script>
    </>
  )
}
