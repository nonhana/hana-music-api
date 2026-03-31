export const audioMatchClientScript = `
const SAMPLE_RATE = 8000
const CLIP_DURATION_SECONDS = 3

const player = document.querySelector('#audio-match-player')
const fileInput = document.querySelector('#audio-match-file')
const runButton = document.querySelector('#audio-match-run')
const useMicInput = document.querySelector('#audio-match-use-mic')
const statusText = document.querySelector('#audio-match-status')
const logPanel = document.querySelector('#audio-match-log')
const resultsPanel = document.querySelector('#audio-match-results')
const waveform = document.querySelector('#audio-match-waveform')
const waveformContext = waveform.getContext('2d')

let audioContext
let recorderNode
let micSourceNode
let audioBuffer
let bufferHealth = 0

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function setStatus(message) {
  statusText.textContent = message
}

function writeLog(message) {
  const previous = logPanel.textContent?.trim()
  logPanel.textContent = previous ? previous + '\\n' + message : message
  logPanel.scrollTop = logPanel.scrollHeight
}

function setResults(content) {
  if (typeof content === 'string') {
    resultsPanel.textContent = content
    return
  }

  resultsPanel.innerHTML = ''
  resultsPanel.append(content)
}

function handleInitializationFailure(error) {
  const message = getErrorMessage(error)
  runButton.disabled = true
  runButton.textContent = '开始识别'
  setStatus('初始化失败：' + message)
  setResults('初始化失败，请检查音频运行时日志')
  writeLog('[audio-match] 初始化失败: ' + message)
}

function renderMatches(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    setResults('没有命中结果')
    return
  }

  const list = document.createElement('ul')
  list.className = 'match-result-list'

  for (const entry of matches) {
    const song = entry?.song
    if (!song?.id) {
      continue
    }

    const item = document.createElement('li')
    const link = document.createElement('a')
    link.href = 'https://music.163.com/song?id=' + song.id
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.textContent =
      song.name + ' - ' + (song.album?.name ?? 'Unknown Album') + ' (' + ((entry?.startTime ?? 0) / 1000).toFixed(2) + 's)'
    item.append(link)
    list.append(item)
  }

  setResults(list.childNodes.length > 0 ? list : '没有命中结果')
}

async function ensureAudioContext() {
  if (audioContext) {
    return audioContext
  }

  audioContext = new AudioContext({
    sampleRate: SAMPLE_RATE,
  })

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  const audioNode = audioContext.createMediaElementSource(player)
  await audioContext.audioWorklet.addModule('/demo/assets/audio-match/rec.js')
  recorderNode = new AudioWorkletNode(audioContext, 'timed-recorder')
  audioNode.connect(recorderNode)
  audioNode.connect(audioContext.destination)
  recorderNode.port.onmessage = handleRecorderMessage

  try {
    const microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
      },
    })
    micSourceNode = audioContext.createMediaStreamSource(microphoneStream)
    micSourceNode.connect(recorderNode)
    useMicInput.checked = true
    writeLog('[audio-match] 麦克风已接入')
  } catch (error) {
    useMicInput.checked = false
    writeLog('[audio-match] 麦克风不可用，将仅使用文件音频')
  }

  writeLog('[audio-match] AudioContext 已启动')
  return audioContext
}

async function handleRecorderFinished(recording) {
  if (typeof globalThis.GenerateFP !== 'function') {
    throw new Error('GenerateFP runtime is unavailable')
  }

  setStatus('生成音频指纹中')
  writeLog('[audio-match] 开始生成指纹')

  const samples = new Float32Array(recording.subarray(0, CLIP_DURATION_SECONDS * SAMPLE_RATE))
  const fingerprint = await globalThis.GenerateFP(samples)
  writeLog('[audio-match] 指纹生成完成')
  setStatus('请求 /audio/match 中')

  const query = new URLSearchParams({
    audioFP: fingerprint,
    duration: String(CLIP_DURATION_SECONDS),
  })
  const response = await fetch('/audio/match?' + query.toString(), {
    method: 'POST',
  })
  const payload = await response.json()
  writeLog('[audio-match] /audio/match 返回 code=' + String(payload?.code ?? 'unknown'))

  const matchData = payload?.data
  const matches = matchData?.result
  if ((!Array.isArray(matches) || matches.length === 0) && typeof matchData?.noMatchReason === 'number') {
    writeLog('[audio-match] noMatchReason=' + String(matchData.noMatchReason))
  }
  renderMatches(matches)
  setStatus(Array.isArray(matches) && matches.length > 0 ? '识别完成' : '识别完成，但没有命中结果')
}

function handleRecorderMessage(event) {
  const data = event.data

  switch (data.message) {
    case 'bufferhealth':
      bufferHealth = data.health ?? 0
      audioBuffer = data.recording
      runButton.textContent = (CLIP_DURATION_SECONDS * (1 - bufferHealth)).toFixed(2) + 's'
      break
    case 'finished':
      runButton.disabled = false
      runButton.textContent = '开始识别'
      handleRecorderFinished(data.recording).catch((error) => {
        const message = getErrorMessage(error)
        writeLog('[audio-match] ' + message)
        setStatus(message)
      })
      break
    default:
      if (typeof data.message === 'string') {
        writeLog(data.message)
      }
  }
}

function drawWaveform() {
  const width = waveform.clientWidth || 640
  const height = waveform.clientHeight || 200
  waveform.width = width
  waveform.height = height
  waveformContext.clearRect(0, 0, width, height)
  waveformContext.fillStyle = 'rgba(37, 99, 235, 0.88)'

  if (audioBuffer) {
    for (let x = 0; x < width * bufferHealth; x += 1) {
      const sample = audioBuffer[Math.ceil((x / width) * audioBuffer.length)] ?? 0
      const magnitude = (Math.abs(sample) * height) / 2
      waveformContext.fillRect(x, height / 2 - (sample > 0 ? magnitude : 0), 1, magnitude)
    }
  }

  window.requestAnimationFrame(drawWaveform)
}

fileInput?.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  if (!file) {
    runButton.disabled = true
    setStatus('等待加载本地音频文件')
    return
  }

  try {
    setStatus('初始化音频运行时中')
    await ensureAudioContext()
    player.src = URL.createObjectURL(file)
    runButton.disabled = false
    setStatus('文件已加载，可以开始识别')
    writeLog('[audio-match] 已加载文件 ' + file.name)
  } catch (error) {
    handleInitializationFailure(error)
  }
})

runButton?.addEventListener('click', async () => {
  try {
    await ensureAudioContext()
    if (!recorderNode) {
      throw new Error('Recorder node is not ready')
    }

    runButton.disabled = true
    setResults('识别中')
    setStatus('录制 ' + CLIP_DURATION_SECONDS + ' 秒样本中')
    recorderNode.port.postMessage({
      duration: CLIP_DURATION_SECONDS,
      message: 'start',
    })
  } catch (error) {
    handleInitializationFailure(error)
  }
})

useMicInput?.addEventListener('change', () => {
  if (!micSourceNode || !recorderNode) {
    return
  }

  if (useMicInput.checked) {
    micSourceNode.connect(recorderNode)
    writeLog('[audio-match] 麦克风混音已开启')
  } else {
    micSourceNode.disconnect(recorderNode)
    writeLog('[audio-match] 麦克风混音已关闭')
  }
})

drawWaveform()
writeLog('[audio-match] 页面初始化完成')
setResults('还没有识别结果')
`
