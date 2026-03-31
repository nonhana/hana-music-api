/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const SearchPage: FC = () => {
  return (
    <>
      <PageHeader
        description="首轮不再复刻旧 `home.html` 的临时脚本，而是提供一个稳定的 `/search` 观测页。"
        eyebrow="Request Debug"
        title="Search Probe"
      />

      <div class="two-column-grid">
        <Surface description="常用关键词搜索，支持保留本地 Cookie。" title="Search Form">
          <form class="stack-form" id="search-form">
            <label class="field">
              <span>Keywords</span>
              <input id="search-keywords" name="keywords" type="text" value="周杰伦" />
            </label>

            <div class="compact-grid">
              <label class="field">
                <span>Type</span>
                <select id="search-type" name="type">
                  <option value="1">单曲</option>
                  <option value="10">专辑</option>
                  <option value="100">歌手</option>
                  <option value="1000">歌单</option>
                  <option value="1002">用户</option>
                </select>
              </label>

              <label class="field">
                <span>Limit</span>
                <input id="search-limit" max="50" min="1" name="limit" type="number" value="10" />
              </label>
            </div>

            <label class="field">
              <span>Cookie</span>
              <textarea
                data-demo-cookie-input
                id="search-cookie"
                name="cookie"
                placeholder="MUSIC_U=..."
                rows={4}
              ></textarea>
            </label>

            <div class="action-row">
              <button class="primary-button" type="submit">
                搜索
              </button>
              <p class="inline-note" id="search-feedback">
                会直接请求 `/search`。
              </p>
            </div>
          </form>
        </Surface>

        <Surface description="返回搜索响应的原始 JSON。" title="Search Result">
          <div class="result-stack">
            <div>
              <h3 class="panel-heading">Resolved URL</h3>
              <pre class="result-panel" id="search-url-preview">
                等待发送请求
              </pre>
            </div>
            <div>
              <h3 class="panel-heading">Raw Response</h3>
              <pre class="result-panel" id="search-result">
                等待返回结果
              </pre>
            </div>
          </div>
        </Surface>
      </div>

      <script src="/demo/client/search.js" type="module"></script>
    </>
  )
}
