const BASE_URL = import.meta.env.VITE_API_URL
/**
 *
 * @param email
 * @param password
 * @returns {Promise<*>}
 */
export async function signIn(email, password) {
    const res = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',          // sends/receives HTTP-only cookie
        body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Sign in failed')
    return data.agent
}

/**
 *
 * @param codename
 * @param email
 * @param password
 * @returns {Promise<*>}
 */
export async function signUp(codename, email, password) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ codename, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Sign up failed')
    return data.agent
}

/**
 *
 * @returns {Promise<void>}
 */
export async function signOut() {
    await fetch(`${BASE_URL}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
    })
}

/**
 *
 * @returns {Promise<*|null>}
 */
export async function getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        credentials: 'include',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.agent
}
