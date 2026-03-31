import type { FC } from 'hono/jsx'

import { CodeBlock } from '../components/code-block.tsx'
import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const QrLoginPage: FC = () => {
  return (
    <>
      <PageHeader description="生成二维码、查看登录状态，并保存当前 Cookie。" title="扫码登录" />

      <div class="two-column-grid">
        <Surface description="扫码后会自动刷新状态并同步 Cookie。" title="登录流程">
          <div class="stack-form">
            <div class="action-row">
              <button class="primary-button" id="qr-refresh" type="button">
                生成新二维码
              </button>
              <label class="toggle">
                <input id="qr-no-cookie" type="checkbox" />
                <span>轮询时不写入 Cookie</span>
              </label>
            </div>

            <div class="qr-layout">
              <div class="qr-card">
                <img alt="登录二维码" id="qr-image" />
              </div>
              <div class="status-stack">
                <p class="inline-note" id="qr-status">
                  初始化中
                </p>
                <button class="secondary-button" id="qr-refresh-status" type="button">
                  读取当前登录态
                </button>
                <button class="secondary-button" id="qr-clear-cookie" type="button">
                  清空 Cookie
                </button>
              </div>
            </div>

            <label class="field">
              <span>Cookie</span>
              <textarea
                data-demo-cookie-input
                id="qr-cookie"
                name="cookie"
                placeholder="扫码成功后会自动写入"
                rows={5}
              ></textarea>
            </label>
          </div>
        </Surface>

        <Surface description="查看当前登录状态返回结果。" title="登录状态">
          <CodeBlock id="qr-login-status" tall>
            等待读取登录态
          </CodeBlock>
        </Surface>
      </div>

      <script src="/demo/client/qr-login.js" type="module"></script>
    </>
  )
}
