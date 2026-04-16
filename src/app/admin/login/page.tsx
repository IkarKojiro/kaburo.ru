'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверный пароль')
      } else {
        router.push('/admin')
      }
    } catch (error) {
      setError('Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="checkout-page">
      <div className="container">
        <div className="panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1 className="page-title">Вход в админ-панель</h1>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ marginTop: '0.5rem' }}
              />
            </label>
            {error && (
              <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
            )}
            <button type="submit" className="cta cta-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
