import type { FC } from 'hono/jsx'

import { CodeBlock } from '../components/code-block.tsx'
import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const AudioMatchPage: FC = () => {
  return (
    <>
      <PageHeader description="上传音频片段识别歌曲，可选混入麦克风。" title="听歌识曲" />

      <div class="two-column-grid">
        <Surface description="选择音频文件后开始识别，可选混入麦克风。" title="音频输入">
          <div class="stack-form">
            <div class="compact-grid audio-match-meta">
              <div class="surface subtle-panel">
                <strong>采样率</strong>
                <span>8 kHz</span>
              </div>
              <div class="surface subtle-panel">
                <strong>采样时长</strong>
                <span>3 秒</span>
              </div>
              <div class="surface subtle-panel">
                <strong>处理方式</strong>
                <span>浏览器生成指纹后再识别</span>
              </div>
            </div>

            <audio controls id="audio-match-player"></audio>

            <label class="field">
              <span>音频文件</span>
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

        <Surface description="查看识别结果和运行日志。" title="识别结果">
          <div class="result-stack">
            <div>
              <h3 class="panel-heading">歌曲列表</h3>
              <div class="match-results" id="audio-match-results">
                还没有识别结果
              </div>
            </div>
            <CodeBlock heading="运行日志" id="audio-match-log" tall>
              等待初始化
            </CodeBlock>
          </div>
        </Surface>
      </div>

      <script src="/demo/assets/audio-match/afp.js"></script>
      <script src="/demo/client/audio-match.js" type="module"></script>
    </>
  )
}
