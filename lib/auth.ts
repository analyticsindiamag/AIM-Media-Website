import { cookies } from 'next/headers'

export async function checkAdminAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin-auth')
  return authCookie?.value === 'authenticated'
}

export async function setAdminAuth() {
  const cookieStore = await cookies()
  cookieStore.set('admin-auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAdminAuth() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-auth')
}

