'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import { Spin } from 'antd'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter()
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, token, router])

  if (isAuthenticated && token) {
    return <>{children}</>
  }

  if (!isAuthenticated || !token) {
    return null
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Spin size="large" />
    </div>
  )
}

export default ProtectedRoute 