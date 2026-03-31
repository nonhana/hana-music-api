/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const QrLoginPage: FC = () => {
  return (
    <>
      <PageHeader
        description="统一承接旧二维码登录页，支持带 Cookie 和 noCookie 两种轮询模式，并把登录 Cookie 保存在浏览器本地。"
        eyebrow="Auth"
        title="QR Login"
      />

      <div class="two-column-grid">
        <Surface description="生成二维码并轮询 `/login/qr/check`。" title="Login Flow">
          <div class="stack-form">
            <div class="action-row">
              <button class="primary-button" id="qr-refresh" type="button">
                生成新二维码
              </button>
              <label class="toggle">
                <input id="qr-no-cookie" type="checkbox" />
                <span>轮询时附加 `noCookie=true`</span>
              </label>
            </div>

            <div class="qr-layout">
              <div class="qr-card">
                <img alt="QR code" id="qr-image" />
              </div>
              <div class="status-stack">
                <p class="inline-note" id="qr-status">
                  初始化中
                </p>
                <button class="secondary-button" id="qr-refresh-status" type="button">
                  读取当前登录态
                </button>
                <button class="secondary-button" id="qr-clear-cookie" type="button">
                  清空本地 Cookie
                </button>
              </div>
            </div>

            <label class="field">
              <span>Stored Cookie</span>
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

        <Surface description="显示 `/login/status` 的原始响应。" title="Login Status">
          <pre class="result-panel tall-result" id="qr-login-status">
            等待读取登录态
          </pre>
        </Surface>
      </div>

      <script src="/demo/client/qr-login.js" type="module"></script>
    </>
  )
}
