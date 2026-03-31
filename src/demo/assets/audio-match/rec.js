/* AudioWorkletProcessor must be initialized as a separate module file. */

class TimedRecorder extends AudioWorkletProcessor {
  constructor() {
    super()
    this.maxLength = 0
    this.recordBuffer = new Float32Array(0)
    this.recording = false
    this.bufferIndex = 0

    this.port.onmessage = (event) => {
      if (event.data?.message !== 'start') {
        return
      }

      this.maxLength = event.data.duration * 8000
      this.recordBuffer = new Float32Array(this.maxLength)
      this.bufferIndex = 0
      this.recording = true
      this.port.postMessage({ message: '[rec.js] Recording started' })
    }
  }

  process(inputs) {
    if (!this.recording) {
      return true
    }

    const channel = inputs[0]?.[0]
    if (!channel) {
      return true
    }

    this.port.postMessage({
      message: 'bufferhealth',
      health: this.bufferIndex / this.maxLength,
      recording: this.recordBuffer,
    })

    if (this.bufferIndex + channel.length > this.maxLength) {
      this.port.postMessage({ message: '[rec.js] Recording finished' })
      this.recording = false
      this.bufferIndex = 0
      this.port.postMessage({
        message: 'finished',
        recording: this.recordBuffer,
      })
      return true
    }

    this.recordBuffer.set(channel, this.bufferIndex)
    this.bufferIndex += channel.length
    return true
  }
}

registerProcessor('timed-recorder', TimedRecorder)
