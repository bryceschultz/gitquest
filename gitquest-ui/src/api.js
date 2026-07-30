import { API_URL } from './buildConfig'

const opts = (method, body) => ({
  method,
  credentials: 'include',
  headers: body ? { 'Content-Type': 'application/json' } : undefined,
  body: body ? JSON.stringify(body) : undefined,
})

async function call(path, method = 'GET', body) {
  const res = await fetch(`${API_URL}${path}`, opts(method, body))
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const apiEnabled = () => Boolean(API_URL)
export const signUp  = (codename, email, password) => call('/auth/signup', 'POST', { codename, email, password })
export const signIn  = (email, password) => call('/auth/signin', 'POST', { email, password })
export const signOut = () => call('/auth/signout', 'POST')
export const me      = () => call('/auth/me').then(d => d.agent).catch(() => null)
export const fetchProgress = () => call('/progress').then(d => d.progress)
export const pushProgress  = (progress) => call('/progress', 'PUT', { progress })
