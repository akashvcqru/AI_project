import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import type { RootState } from '../store'
import { setCredentials, logout } from '../slices/authSlice'
import { useLoginMutation } from '../services/adminApi'

export const useAuth = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loginMutation] = useLoginMutation()
  
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap()
      dispatch(setCredentials({ token: result.token, user: result.user }))
      router.push('/admin')
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }, [dispatch, loginMutation, router])

  const handleLogout = useCallback(() => {
    dispatch(logout())
    router.push('/login')
  }, [dispatch, router])

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    logout: handleLogout
  }
} 