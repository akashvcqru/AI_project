import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: {
    email: string
    name: string
  } | null
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('adminToken') : false,
  user: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', token)
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken')
      }
    },
    updateUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload
    }
  }
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer 