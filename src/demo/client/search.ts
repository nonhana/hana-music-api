export const searchClientScript = `
import {
  fetchJson,
  getStoredCookie,
  setFormattedResult,
  setTextContent,
  syncCookieInputs,
} from '/demo/client/shared.js'

const form = document.querySelector('#search-form')
const keywordsInput = document.querySelector('#search-keywords')
const typeInput = document.querySelector('#search-type')
const limitInput = document.querySelector('#search-limit')
const cookieInput = document.querySelector('#search-cookie')
const urlPreview = document.querySelector('#search-url-preview')
const resultPanel = document.querySelector('#search-result')
const feedback = document.querySelector('#search-feedback')

function buildSearchUrl() {
  const params = new URLSearchParams()
  params.set('keywords', keywordsInput.value.trim())
  params.set('type', typeInput.value)
  params.set('limit', limitInput.value)

  const cookie = cookieInput.value.trim() || getStoredCookie()
  if (cookie) {
    params.set('cookie', cookie)
  }

  return '/search?' + params.toString()
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  syncCookieInputs()

  const url = buildSearchUrl()

  setTextContent(feedback, '搜索中')
  setTextContent(urlPreview, url)
  setTextContent(resultPanel, '等待响应')

  try {
    const { data, response } = await fetchJson(url)

    setTextContent(feedback, response.ok ? '搜索完成' : '请求返回非 200 状态')
    setFormattedResult(resultPanel, data)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setTextContent(feedback, '搜索失败')
    setTextContent(resultPanel, message)
  }
})
`
