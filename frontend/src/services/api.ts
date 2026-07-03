import axios from 'axios'
import Taro from '@tarojs/taro'

const api = axios.create({
  baseURL: '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (process.env.TARO_ENV === 'h5' && typeof window !== 'undefined') {
    const url = config.url || ''
    if (url.startsWith('/api/') || url === '/api' || url === '/api/') {
      const { hostname, protocol, port } = window.location
      const targetPort = '8000'
      if (port !== targetPort) {
        config.url = `${protocol}//${hostname}:${targetPort}${url}`
      }
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const detail = err?.response?.data?.detail
    if (status === 422 || status === 404 || status === 400) {
      console.error('[API ERROR]', {
        url: err?.config?.url,
        method: err?.config?.method?.toUpperCase(),
        status,
        detail,
        request_body: err?.config?.data,
      })
      if (typeof Taro?.showToast === 'function') {
        Taro.showToast({ title: detail || `请求错误 ${status}`, icon: 'none' })
      }
    } else if (err?.code === 'ERR_NETWORK' || !err?.response) {
      console.error('[API NETWORK ERROR]', { url: err?.config?.url, message: err?.message })
    }
    return Promise.reject(err)
  },
)

export default api
