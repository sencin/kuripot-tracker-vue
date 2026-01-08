const apiBaseUrl = import.meta.env.VITE_RESTAPI_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

async function request<T>(
  path: string,       // only the endpoint, not full URL
  method: HttpMethod,
  token?: string,
  body?: unknown
): Promise<T> {
  const url = `${apiBaseUrl}${path}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.status === 204 ? null as T : res.json()
}

export const HTTPRequest = {
  get<T>(path: string, token?: string) {
    return request<T>(path, 'GET', token)
  },

  post<T>(path: string, token?: string, body?: unknown) {
    return request<T>(path, 'POST', token, body)
  },

  put<T>(path: string, token?: string, body?: unknown) {
    return request<T>(path, 'PUT', token, body)
  },

  patch<T>(path: string, token?: string, body?: unknown) {
    return request<T>(path, 'PATCH', token, body)
  },

  delete<T>(path: string, token?: string) {
    return request<T>(path, 'DELETE', token)
  },
}
