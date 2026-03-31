/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const AudioMatchPage: FC = () => {
  return (
    <>
      <PageHeader
        description="实验页恢复旧听歌识曲链路：浏览器端生成音频指纹，再直接请求 `/audio/match`。"
        eyebrow="Experiments"
        title="Audio Match"
      />

      <div class="two-column-grid">
        <Surface
          description="选择本地音频文件后点击识别。可选开启麦克风混音，把环境声一起送进指纹生成。"
          title="Fingerprint Capture"
        >
          <div class="stack-form">
            <div class="compact-grid audio-match-meta">
              <div class="surface subtle-panel">
                <strong>Sample Rate</strong>
                <span>固定 8 kHz，与旧 AFP.wasm 约束保持一致。</span>
              </div>
              <div class="surface subtle-panel">
                <strong>Clip Window</strong>
                <span>默认采样 3 秒音频片段。</span>
              </div>
              <div class="surface subtle-panel">
                <strong>Runtime</strong>
                <span>本地浏览器完成指纹生成，服务端只负责命中 `/audio/match`。</span>
              </div>
            </div>

            <audio controls id="audio-match-player"></audio>

            <label class="field">
              <span>Audio File</span>
              <input accept="audio/*" id="audio-match-file" type="file" />
            </label>

            <label class="toggle">
              <input id="audio-match-use-mic" type="checkbox" />
              <span>混入麦克风输入</span>
            </label>

            <div class="action-row">
              <button class="primary-button" disabled id="audio-match-run" type="button">
                开始识别
              </button>
              <p class="inline-note" id="audio-match-status">
                等待加载本地音频文件
              </p>
            </div>

            <canvas id="audio-match-waveform"></canvas>
          </div>
        </Surface>

        <Surface description="原始识别结果、日志和命中的歌曲列表。" title="Results">
          <div class="result-stack">
            <div>
              <h3 class="panel-heading">Matched Songs</h3>
              <div class="match-results" id="audio-match-results">
                还没有识别结果
              </div>
            </div>
            <div>
              <h3 class="panel-heading">Runtime Log</h3>
              <pre class="result-panel tall-result" id="audio-match-log">
                等待初始化
              </pre>
            </div>
          </div>
        </Surface>
      </div>

      <script src="/demo/assets/audio-match/afp.js"></script>
      <script src="/demo/client/audio-match.js" type="module"></script>
    </>
  )
}
