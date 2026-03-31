export const sharedClientScript = `
const DEMO_COOKIE_KEY = 'hana-demo-cookie'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function getStoredCookie() {
  if (!isBrowser()) {
    return ''
  }

  return window.localStorage.getItem(DEMO_COOKIE_KEY) ?? ''
}

export function setStoredCookie(value) {
  if (!isBrowser()) {
    return
  }

  const trimmed = value.trim()
  if (trimmed) {
    window.localStorage.setItem(DEMO_COOKIE_KEY, trimmed)
  } else {
    window.localStorage.removeItem(DEMO_COOKIE_KEY)
  }

  syncCookieInputs()
}

export function syncCookieInputs(root = document) {
  const cookie = getStoredCookie()
  for (const input of root.querySelectorAll('[data-demo-cookie-input]')) {
    if (!(input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement)) {
      continue
    }

    if (document.activeElement !== input) {
      input.value = cookie
    }

    if (!input.dataset.demoCookieBound) {
      input.addEventListener('input', () => {
        setStoredCookie(input.value)
      })
      input.dataset.demoCookieBound = 'true'
    }
  }
}

export function formatJson(value) {
  return JSON.stringify(value, null, 2)
}

async function fallbackCopyText(value) {
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', 'true')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()

  try {
    document.execCommand('copy')
  } finally {
    input.remove()
  }
}

export async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  await fallbackCopyText(value)
}

export function setTextContent(target, value) {
  target.textContent = value
}

export function setFormattedResult(target, value) {
  target.textContent = typeof value === 'string' ? value : formatJson(value)
}

export async function readJsonResponse(response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function fetchJson(url, init) {
  const response = await fetch(url, init)
  const data = await readJsonResponse(response)

  return {
    data,
    response,
  }
}

export function initCopyButtons(root = document) {
  for (const element of root.querySelectorAll('[data-copy-button]')) {
    if (!(element instanceof HTMLButtonElement) || element.dataset.copyBound) {
      continue
    }

    element.dataset.copyBound = 'true'
    element.addEventListener('click', async () => {
      const targetId = element.dataset.copyTarget ?? ''
      const target = targetId ? document.getElementById(targetId) : null
      const label = element.querySelector('[data-copy-label]')
      const defaultLabel = element.dataset.copyDefaultLabel ?? '复制'

      if (!(label instanceof HTMLElement) || !target) {
        return
      }

      const text = target.textContent ?? ''
      const previousTimerId = Number(element.dataset.copyResetTimer ?? '0')
      if (previousTimerId) {
        window.clearTimeout(previousTimerId)
      }

      try {
        await copyText(text)
        label.textContent = '已复制'
        element.dataset.copyState = 'success'
      } catch {
        label.textContent = '复制失败'
        element.dataset.copyState = 'error'
      }

      const timerId = window.setTimeout(() => {
        label.textContent = defaultLabel
        delete element.dataset.copyState
        delete element.dataset.copyResetTimer
      }, 1600)

      element.dataset.copyResetTimer = String(timerId)
    })
  }
}

function initializeSharedUi() {
  syncCookieInputs()
  initCopyButtons()
}

initializeSharedUi()
document.addEventListener('DOMContentLoaded', initializeSharedUi)
`
