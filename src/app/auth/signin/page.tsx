'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignIn() {
  const router = useRouter()

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Balanz</h1>
          <p className="text-gray-600 mb-6">Control de gastos personal</p>
          
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  )
}