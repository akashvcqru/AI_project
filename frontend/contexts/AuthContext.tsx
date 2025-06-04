'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  adminUser: AdminUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

interface AdminUser {
  email: string
  name: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('adminToken')
        const userData = localStorage.getItem('adminUser')
        
        if (token && userData) {
          const user = JSON.parse(userData)
          setAdminUser(user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        // Clear invalid data
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // For demo purposes, we'll use a simple hardcoded admin check
      // In production, this should call your backend API
      if (email === 'admin@admin.com' && password === 'admin123') {
        const adminUser: AdminUser = {
          email: email,
          name: 'Super Admin',
          role: 'admin'
        }
        
        // Store in localStorage
        const token = 'admin-token-' + Date.now()
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminUser', JSON.stringify(adminUser))
        
        setAdminUser(adminUser)
        setIsAuthenticated(true)
        
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setAdminUser(null)
    setIsAuthenticated(false)
  }

  const value: AuthContextType = {
    isAuthenticated,
    adminUser,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 