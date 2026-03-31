import type { FC } from 'hono/jsx'

import { CodeBlock } from '../components/code-block.tsx'
import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const UploadPlaylistCoverPage: FC = () => {
  return (
    <>
      <PageHeader description="读取歌单当前封面并上传新图片。" title="歌单封面" />

      <div class="two-column-grid">
        <Surface description="填写歌单信息、裁剪参数和图片文件。" title="上传参数">
          <form class="stack-form" id="playlist-cover-form">
            <label class="field">
              <span>歌单 ID</span>
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
              <span>图片文件</span>
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
              准备开始上传
            </p>
          </form>
        </Surface>

        <Surface description="查看封面预览和接口返回结果。" title="预览">
          <div class="preview-stack">
            <div class="cover-preview-shell">
              <img alt="歌单封面预览" id="playlist-cover-preview" />
            </div>
            <CodeBlock id="playlist-result" tall>
              等待读取或上传
            </CodeBlock>
          </div>
        </Surface>
      </div>

      <script src="/demo/client/upload-playlist-cover.js" type="module"></script>
    </>
  )
}
