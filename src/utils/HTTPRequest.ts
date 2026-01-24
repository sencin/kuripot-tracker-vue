// /utils/HTTPRequest.ts
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

const apiBaseUrl = import.meta.env.VITE_RESTAPI_URL

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Generic request function returning full AxiosResponse
async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  token?: string
): Promise<AxiosResponse<T>> {
  const config: AxiosRequestConfig = {
    method,
    url: `${apiBaseUrl}${path}`, // prepend base URL
    data: body,
    withCredentials: true, // send cookies
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }

  return axios(config)
}

// CRUD helpers returning full response
export const HTTPRequest = {
  get: <T>(path: string, token?: string) => request<T>(path, 'GET', undefined, token),
  post: <T>(path: string, body?: unknown, token?: string) => request<T>(path, 'POST', body, token),
  put: <T>(path: string, body?: unknown, token?: string) => request<T>(path, 'PUT', body, token),
  patch: <T>(path: string, body?: unknown, token?: string) => request<T>(path, 'PATCH', body, token),
  delete: <T>(path: string, token?: string) => request<T>(path, 'DELETE', undefined, token),
}
