export const uploadPlaylistCoverClientScript = `
import {
  fetchJson,
  getStoredCookie,
  setFormattedResult,
  setTextContent,
  syncCookieInputs,
} from '/demo/client/shared.js'

const form = document.querySelector('#playlist-cover-form')
const loadButton = document.querySelector('#playlist-load')
const playlistIdInput = document.querySelector('#playlist-id')
const cookieInput = document.querySelector('#playlist-cookie')
const imgSizeInput = document.querySelector('#playlist-img-size')
const imgXInput = document.querySelector('#playlist-img-x')
const imgYInput = document.querySelector('#playlist-img-y')
const fileInput = document.querySelector('#playlist-file')
const previewImage = document.querySelector('#playlist-cover-preview')
const feedback = document.querySelector('#playlist-feedback')
const resultPanel = document.querySelector('#playlist-result')

function readCookie() {
  return cookieInput.value.trim() || getStoredCookie()
}

function readPlaylistId() {
  return playlistIdInput.value.trim()
}

function ensurePlaylistId() {
  const playlistId = readPlaylistId()
  if (!playlistId) {
    throw new Error('请先填写歌单 ID')
  }

  return playlistId
}

async function getImageSize(file) {
  const bitmap = await createImageBitmap(file)
  return {
    height: bitmap.height,
    width: bitmap.width,
  }
}

async function loadPlaylistDetail() {
  const playlistId = ensurePlaylistId()
  const params = new URLSearchParams({
    id: playlistId,
    timestamp: String(Date.now()),
  })

  const cookie = readCookie()
  if (cookie) {
    params.set('cookie', cookie)
  }

  setTextContent(feedback, '读取歌单详情中')
  const { data, response } = await fetchJson('/playlist/detail?' + params.toString())

  const coverUrl = data?.playlist?.coverImgUrl ?? ''
  previewImage.src = coverUrl
  setFormattedResult(resultPanel, data)
  setTextContent(feedback, response.ok ? '已读取当前封面' : '读取返回非 200 状态')
}

loadButton?.addEventListener('click', () => {
  loadPlaylistDetail().catch((error) => {
    setTextContent(feedback, error instanceof Error ? error.message : String(error))
    setFormattedResult(resultPanel, {
      error: error instanceof Error ? error.message : String(error),
    })
  })
})

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  syncCookieInputs()

  try {
    const playlistId = ensurePlaylistId()
    const file = fileInput.files?.[0]

    if (!file) {
      throw new Error('请先选择图片文件')
    }

    const imageSize = await getImageSize(file)
    const params = new URLSearchParams({
      id: playlistId,
      imgSize: imgSizeInput.value || String(imageSize.width),
      imgX: imgXInput.value || '0',
      imgY: imgYInput.value || '0',
      timestamp: String(Date.now()),
    })

    const cookie = readCookie()
    if (cookie) {
      params.set('cookie', cookie)
    }

    const formData = new FormData()
    formData.set('imgFile', file)

    setTextContent(feedback, '上传中')
    const { data, response } = await fetchJson('/playlist/cover/update?' + params.toString(), {
      body: formData,
      method: 'POST',
    })

    const coverUrl = data?.data?.url ?? ''
    if (coverUrl) {
      previewImage.src = coverUrl
    }

    setFormattedResult(resultPanel, {
      imageSize,
      response: data,
    })
    setTextContent(feedback, response.ok ? '上传完成' : '上传返回非 200 状态')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setTextContent(feedback, message)
    setFormattedResult(resultPanel, {
      error: message,
    })
  }
})

syncCookieInputs()
`
