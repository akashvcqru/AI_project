import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

interface OnboardingResponse {
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

interface OnboardingRequest {
  email: string
  companyName: string
  directorName: string
  panNumber: string
  gstNumber: string
  documents: {
    panCard: File
    gstCertificate: File
    directorIdProof: File
  }
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  }),
  tagTypes: ['Onboarding'],
  endpoints: (builder) => ({
    // Check if email exists
    checkEmail: builder.query<{ exists: boolean }, string>({
      query: (email) => `/onboarding/check-email?email=${email}`,
    }),

    // Submit onboarding application
    submitOnboarding: builder.mutation<OnboardingResponse, OnboardingRequest>({
      query: (data) => {
        const formData = new FormData()
        formData.append('email', data.email)
        formData.append('companyName', data.companyName)
        formData.append('directorName', data.directorName)
        formData.append('panNumber', data.panNumber)
        formData.append('gstNumber', data.gstNumber)
        formData.append('panCard', data.documents.panCard)
        formData.append('gstCertificate', data.documents.gstCertificate)
        formData.append('directorIdProof', data.documents.directorIdProof)

        return {
          url: '/onboarding/submit',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Onboarding'],
    }),

    // Get onboarding status
    getOnboardingStatus: builder.query<OnboardingResponse, string>({
      query: (email) => `/onboarding/status?email=${email}`,
      providesTags: (result, error, email) => [{ type: 'Onboarding', id: email }],
    }),

    // Resend verification email
    resendVerification: builder.mutation<{ message: string }, string>({
      query: (email) => ({
        url: '/onboarding/resend-verification',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
})

export const {
  useCheckEmailQuery,
  useSubmitOnboardingMutation,
  useGetOnboardingStatusQuery,
  useResendVerificationMutation,
} = onboardingApi 