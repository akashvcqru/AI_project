import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  email: string
  isSuperAdmin: boolean
  message?: string
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
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/Admin/login',
        method: 'POST',
        body: {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password
        },
      }),
      transformResponse: (response: any) => {
        console.log('Raw login response:', response)
        return {
          email: response.email,
          isSuperAdmin: response.isSuperAdmin,
          message: response.message
        }
      },
      transformErrorResponse: (response: any) => {
        console.error('Login error response:', response)
        return {
          message: response.data?.message || 'Login failed. Please try again.'
        }
      }
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

    getStats: builder.query<StatsResponse, void>({
      query: () => '/Admin/stats',
      providesTags: ['Stats'],
    }),

    getCompanies: builder.query<CompanyEntry[], void>({
      query: () => '/Admin/onboarding-entries?limit=5',
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