import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store'
import { setCredentials, logout, setLoading } from '../slices/authSlice'

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
        dispatch(
          setCredentials({
            token: storedToken,
            user: JSON.parse(storedUser),
          })
        )
      } else {
        dispatch(setLoading(false))
      }
    }

    initializeAuth()
  }, [dispatch])

  const login = (user: any, token: string) => {
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