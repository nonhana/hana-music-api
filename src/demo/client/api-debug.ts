export const apiDebugClientScript = `
import { formatJson, fetchJson, setFormattedResult, setTextContent } from '/demo/client/shared.js'

const form = document.querySelector('#api-debug-form')
const uriInput = document.querySelector('#api-uri')
const cryptoInput = document.querySelector('#api-crypto')
const dataInput = document.querySelector('#api-data')
const requestPreview = document.querySelector('#api-request-preview')
const resultPanel = document.querySelector('#api-result')
const feedback = document.querySelector('#api-feedback')

form?.addEventListener('submit', async (event) => {
  event.preventDefault()

  try {
    const parsedData = JSON.parse(dataInput.value)
    const payload = {
      crypto: cryptoInput.value,
      data: parsedData,
      uri: uriInput.value,
    }

    setTextContent(feedback, '请求发送中')
    setFormattedResult(requestPreview, payload)
    setTextContent(resultPanel, '等待响应')

    const { data, response } = await fetchJson('/api?timestamp=' + Date.now(), {
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    setTextContent(feedback, response.ok ? '请求完成' : '请求返回非 200 状态')
    setFormattedResult(resultPanel, data)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setTextContent(feedback, '请求失败')
    setTextContent(resultPanel, message)
    setTextContent(
      requestPreview,
      formatJson({
        crypto: cryptoInput.value,
        rawData: dataInput.value,
        uri: uriInput.value,
      }),
    )
  }
})
`
