import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store'
import { setCredentials, logout, setLoading } from '../slices/authSlice'

interface AdminUser {
  email: string;
  isSuperAdmin: boolean;
}

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  )

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('adminToken')
      const storedUser = localStorage.getItem('adminUser')

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as AdminUser
          dispatch(
            setCredentials({
              token: storedToken,
              user: parsedUser,
            })
          )
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
        }
      }
      dispatch(setLoading(false))
    }

    initializeAuth()
  }, [dispatch])

  const login = (user: AdminUser, token: string) => {
    localStorage.setItem('adminToken', token)
    localStorage.setItem('adminUser', JSON.stringify(user))
    dispatch(setCredentials({ user, token }))
  }

  const logoutUser = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    dispatch(logout())
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: logoutUser,
  }
} 