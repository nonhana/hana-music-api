/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const UploadPlaylistCoverPage: FC = () => {
  return (
    <>
      <PageHeader
        description="首批上传页保留最关键的两个动作：读取歌单当前封面、上传新图片并立即查看返回结果。"
        eyebrow="Upload"
        title="Playlist Cover Upload"
      />

      <div class="two-column-grid">
        <Surface description="输入歌单 id、Cookie 和裁剪参数后执行读取或上传。" title="Upload Form">
          <form class="stack-form" id="playlist-cover-form">
            <label class="field">
              <span>Playlist ID</span>
              <input id="playlist-id" name="playlistId" placeholder="3143833470" type="text" />
            </label>

            <label class="field">
              <span>Cookie</span>
              <textarea
                data-demo-cookie-input
                id="playlist-cookie"
                name="cookie"
                placeholder="MUSIC_U=..."
                rows={4}
              ></textarea>
            </label>

            <div class="compact-grid">
              <label class="field">
                <span>imgSize</span>
                <input id="playlist-img-size" min="1" name="imgSize" type="number" value="300" />
              </label>

              <label class="field">
                <span>imgX</span>
                <input id="playlist-img-x" min="0" name="imgX" type="number" value="0" />
              </label>

              <label class="field">
                <span>imgY</span>
                <input id="playlist-img-y" min="0" name="imgY" type="number" value="0" />
              </label>
            </div>

            <label class="field">
              <span>Image File</span>
              <input accept="image/*" id="playlist-file" name="imgFile" type="file" />
            </label>

            <div class="action-row">
              <button class="primary-button" id="playlist-load" type="button">
                读取当前封面
              </button>
              <button class="secondary-button" type="submit">
                上传新封面
              </button>
            </div>
            <p class="inline-note" id="playlist-feedback">
              上传时会直接调用 `/playlist/cover/update`。
            </p>
          </form>
        </Surface>

        <Surface description="显示当前封面预览和接口返回。" title="Preview">
          <div class="preview-stack">
            <div class="cover-preview-shell">
              <img alt="Playlist cover preview" id="playlist-cover-preview" />
            </div>
            <pre class="result-panel tall-result" id="playlist-result">
              等待读取或上传
            </pre>
          </div>
        </Surface>
      </div>

      <script src="/demo/client/upload-playlist-cover.js" type="module"></script>
    </>
  )
}
