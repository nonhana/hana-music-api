import type { FC } from 'hono/jsx'

import { CodeBlock } from '../components/code-block.tsx'
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
      <PageHeader description="填写接口地址、加密方式和请求体后直接发送请求。" title="API 请求" />

      <div class="two-column-grid">
        <Surface description="支持自定义接口地址、加密方式和 JSON 请求体。" title="请求参数">
          <form class="stack-form" id="api-debug-form">
            <label class="field">
              <span>接口地址</span>
              <input id="api-uri" name="uri" type="text" value="/api/song/lyric/v1" />
            </label>

            <label class="field">
              <span>加密方式</span>
              <select id="api-crypto" name="crypto">
                <option value="">(默认)</option>
                <option value="weapi">weapi</option>
                <option value="eapi">eapi</option>
                <option value="api">api</option>
                <option value="linuxapi">linuxapi</option>
              </select>
            </label>

            <label class="field">
              <span>请求体</span>
              <textarea id="api-data" name="data" rows={14}>
                {API_DEBUG_SAMPLE}
              </textarea>
            </label>

            <div class="action-row">
              <button class="primary-button" type="submit">
                发送请求
              </button>
              <p class="inline-note" id="api-feedback">
                结果会显示在下方结果面板。
              </p>
            </div>
          </form>
        </Surface>

        <Surface description="查看本次请求内容和接口返回结果。" title="返回结果">
          <div class="result-stack">
            <CodeBlock heading="请求内容" id="api-request-preview">
              等待发送请求
            </CodeBlock>
            <CodeBlock heading="响应内容" id="api-result" tall>
              等待返回结果
            </CodeBlock>
          </div>
        </Surface>
      </div>

      <script src="/demo/client/api-debug.js" type="module"></script>
    </>
  )
}
