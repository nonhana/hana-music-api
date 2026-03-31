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

document.addEventListener('DOMContentLoaded', () => {
  syncCookieInputs()
})
`
