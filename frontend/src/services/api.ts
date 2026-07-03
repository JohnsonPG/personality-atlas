import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
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
    }
    return Promise.reject(err)
  },
)

export default api
