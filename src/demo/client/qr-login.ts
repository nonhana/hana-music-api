export const qrLoginClientScript = `
import {
  fetchJson,
  getStoredCookie,
  setFormattedResult,
  setStoredCookie,
  setTextContent,
  syncCookieInputs,
} from '/demo/client/shared.js'

const image = document.querySelector('#qr-image')
const statusText = document.querySelector('#qr-status')
const loginStatusPanel = document.querySelector('#qr-login-status')
const refreshButton = document.querySelector('#qr-refresh')
const refreshStatusButton = document.querySelector('#qr-refresh-status')
const clearCookieButton = document.querySelector('#qr-clear-cookie')
const noCookieCheckbox = document.querySelector('#qr-no-cookie')

let activeKey = ''
let timerId = null

function stopPolling() {
  if (timerId !== null) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function getStatusLabel(code) {
  switch (code) {
    case 800:
      return '二维码已过期'
    case 801:
      return '等待扫码'
    case 802:
      return '等待确认'
    case 803:
      return '授权登录成功'
    default:
      return '等待轮询结果'
  }
}

async function loadLoginStatus(cookie = getStoredCookie()) {
  setTextContent(statusText, '读取登录态中')
  const { data } = await fetchJson('/login/status?timestamp=' + Date.now(), {
    body: JSON.stringify({
      cookie,
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  setFormattedResult(loginStatusPanel, data)
  setTextContent(statusText, cookie ? '已同步本地 Cookie 对应的登录态' : '当前本地没有保存 Cookie')
}

async function pollStatus() {
  if (!activeKey) {
    return
  }

  const params = new URLSearchParams({
    key: activeKey,
    timestamp: String(Date.now()),
  })

  if (noCookieCheckbox.checked) {
    params.set('noCookie', 'true')
  }

  const { data } = await fetchJson('/login/qr/check?' + params.toString())
  const code = typeof data?.code === 'number' ? data.code : 0

  setTextContent(statusText, getStatusLabel(code))

  if (code === 800) {
    stopPolling()
    return
  }

  if (code === 803) {
    stopPolling()
    const cookie = typeof data?.cookie === 'string' ? data.cookie : ''
    if (cookie) {
      setStoredCookie(cookie)
      syncCookieInputs()
      await loadLoginStatus(cookie)
    }
  }
}

async function refreshQrCode() {
  stopPolling()
  setTextContent(statusText, '生成二维码中')

  const keyResult = await fetchJson('/login/qr/key?timestamp=' + Date.now())
  activeKey = keyResult.data?.data?.unikey ?? ''

  const createParams = new URLSearchParams({
    key: activeKey,
    platform: 'web',
    qrimg: 'true',
    timestamp: String(Date.now()),
  })
  const createResult = await fetchJson('/login/qr/create?' + createParams.toString())
  image.src = createResult.data?.data?.qrimg ?? ''
  setTextContent(statusText, '二维码已生成，开始轮询')

  await pollStatus()
  timerId = window.setInterval(() => {
    pollStatus().catch((error) => {
      setTextContent(statusText, error instanceof Error ? error.message : String(error))
    })
  }, 3000)
}

refreshButton?.addEventListener('click', () => {
  refreshQrCode().catch((error) => {
    setTextContent(statusText, error instanceof Error ? error.message : String(error))
  })
})

refreshStatusButton?.addEventListener('click', () => {
  loadLoginStatus().catch((error) => {
    setFormattedResult(loginStatusPanel, {
      error: error instanceof Error ? error.message : String(error),
    })
  })
})

clearCookieButton?.addEventListener('click', () => {
  setStoredCookie('')
  syncCookieInputs()
  setFormattedResult(loginStatusPanel, {
    ok: false,
    reason: 'local cookie cleared',
  })
  setTextContent(statusText, '本地 Cookie 已清空')
})

window.addEventListener('beforeunload', () => {
  stopPolling()
})

syncCookieInputs()
loadLoginStatus().catch(() => {
  setTextContent(statusText, '尚未建立登录态')
})
refreshQrCode().catch((error) => {
  setTextContent(statusText, error instanceof Error ? error.message : String(error))
})
`
