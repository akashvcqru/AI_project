import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

interface VerifyEmailRequest {
  email: string
}

interface VerificationResponse {
  success: boolean
  message: string
}

interface EKYCRequest {
  panNumber: string
  gstNumber: string
}

interface CompanyDetailsRequest {
  name: string
  category: string
  websiteUrl: string
  country: string
  state: string
  city: string
  address: string
}

interface DirectorDetailsRequest {
  aadharNumber: string
  panNumber: string
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://localhost:7001/api',
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
    credentials: 'include',
    mode: 'cors',
  }),
  endpoints: (builder) => ({
    verifyEmail: builder.mutation<VerificationResponse, VerifyEmailRequest>({
      query: (credentials) => ({
        url: '/account/verify-email',
        method: 'POST',
        body: credentials,
      }),
    }),
    submitEKYC: builder.mutation<void, EKYCRequest>({
      query: (data) => ({
        url: '/user/ekyc',
        method: 'POST',
        body: data,
      }),
    }),
    submitCompanyDetails: builder.mutation<void, CompanyDetailsRequest>({
      query: (data) => ({
        url: '/user/company',
        method: 'POST',
        body: data,
      }),
    }),
    submitDirectorDetails: builder.mutation<void, DirectorDetailsRequest>({
      query: (data) => ({
        url: '/user/director',
        method: 'POST',
        body: data,
      }),
    }),
    submitOnboarding: builder.mutation<void, void>({
      query: () => ({
        url: '/user/submit',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useVerifyEmailMutation,
  useSubmitEKYCMutation,
  useSubmitCompanyDetailsMutation,
  useSubmitDirectorDetailsMutation,
  useSubmitOnboardingMutation,
} = onboardingApi 