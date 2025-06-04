import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: 'admin'
  }
}

interface DashboardStats {
  totalUsers: number
  pendingApprovals: number
  completedOnboarding: number
  rejectedApplications: number
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/admin',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
    }),
  }),
})

export const { useLoginMutation, useGetDashboardStatsQuery } = adminApi 