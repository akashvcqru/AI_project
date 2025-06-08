'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/store/hooks/useAuth'
import { Spin } from 'antd'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [mounted, isAuthenticated, isLoading, pathname, router])

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  return <>{children}</>
} 