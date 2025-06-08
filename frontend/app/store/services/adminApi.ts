import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface StatsResponse {
  totalEntries: number
  pendingEntries: number
  approvedEntries: number
  rejectedEntries: number
}

interface CompanyEntry {
  id: number
  email: string
  companyName: string
  directorName: string
  panNumber: string
  gstNumber: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
  updatedAt: string
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://localhost:7001/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', '*/*')
      return headers
    },
  }),
  tagTypes: ['Company', 'Stats'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => {
        // Ensure email is lowercase and trimmed
        const email = credentials.email.toLowerCase().trim()
        const password = credentials.password.trim()
        
        const requestBody = {
          email,
          password
        }
        
        console.log('Login request details:', {
          url: '/Admin/login',
          method: 'POST',
          body: requestBody,
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        })
        
        return {
          url: '/Admin/login',
          method: 'POST',
          body: requestBody,
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        }
      },
      transformErrorResponse: (response: any) => {
        console.log('Raw error response:', response)
        
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          return { message: 'Invalid email or password' }
        }
        
        // Handle both error formats
        if (response.data?.message) {
          return { message: response.data.message }
        }
        if (response.error?.message) {
          return { message: response.error.message }
        }
        return { message: 'An error occurred during login' }
      },
      transformResponse: (response) => {
        console.log('Login success response:', response)
        return response
      },
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (passwords) => ({
        url: '/Admin/change-password',
        method: 'POST',
        body: passwords,
      }),
    }),
    updateProfile: builder.mutation<{ user: LoginResponse['user'] }, { name: string; email: string }>({
      query: (profile) => ({
        url: '/Admin/profile',
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['Company'],
    }),

    // Stats endpoint
    getStats: builder.query<StatsResponse, void>({
      query: () => '/Admin/stats',
      providesTags: ['Stats'],
    }),

    // Company endpoints
    getCompanies: builder.query<CompanyEntry[], void>({
      query: () => '/Admin/companies',
      providesTags: ['Company'],
    }),
    getCompanyById: builder.query<CompanyEntry, string>({
      query: (id) => `/Admin/companies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    approveCompany: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/Admin/companies/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Company', 'Stats'],
    }),
    rejectCompany: builder.mutation<{ message: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/Admin/companies/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Company', 'Stats'],
    }),
  }),
})

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useGetStatsQuery,
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
} = adminApi 