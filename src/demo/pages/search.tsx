import type { FC } from 'hono/jsx'

import { CodeBlock } from '../components/code-block.tsx'
import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const SearchPage: FC = () => {
  return (
    <>
      <PageHeader description="按关键词搜索并查看请求地址与返回结果。" title="搜索" />

      <div class="two-column-grid">
        <Surface description="支持搜索歌曲、专辑、歌手、歌单和用户。" title="搜索参数">
          <form class="stack-form" id="search-form">
            <label class="field">
              <span>关键词</span>
              <input id="search-keywords" name="keywords" type="text" value="周杰伦" />
            </label>

            <div class="compact-grid">
              <label class="field">
                <span>类型</span>
                <select id="search-type" name="type">
                  <option value="1">单曲</option>
                  <option value="10">专辑</option>
                  <option value="100">歌手</option>
                  <option value="1000">歌单</option>
                  <option value="1002">用户</option>
                </select>
              </label>

              <label class="field">
                <span>数量</span>
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
                准备开始搜索
              </p>
            </div>
          </form>
        </Surface>

        <Surface description="查看请求地址和搜索结果。" title="搜索结果">
          <div class="result-stack">
            <CodeBlock heading="请求地址" id="search-url-preview">
              等待发送请求
            </CodeBlock>
            <CodeBlock heading="响应内容" id="search-result" tall>
              等待返回结果
            </CodeBlock>
          </div>
        </Surface>
      </div>

      <script src="/demo/client/search.js" type="module"></script>
    </>
  )
}
