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
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Company', 'Stats'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (passwords) => ({
        url: '/admin/change-password',
        method: 'POST',
        body: passwords,
      }),
    }),
    updateProfile: builder.mutation<{ user: LoginResponse['user'] }, { name: string; email: string }>({
      query: (profile) => ({
        url: '/admin/profile',
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['Company'],
    }),

    // Stats endpoint
    getStats: builder.query<StatsResponse, void>({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),

    // Company endpoints
    getCompanies: builder.query<CompanyEntry[], void>({
      query: () => '/admin/companies',
      providesTags: ['Company'],
    }),
    getCompanyById: builder.query<CompanyEntry, string>({
      query: (id) => `/admin/companies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    approveCompany: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/companies/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Company', 'Stats'],
    }),
    rejectCompany: builder.mutation<{ message: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/companies/${id}/reject`,
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