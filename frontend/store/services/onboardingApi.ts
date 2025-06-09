import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../index'

interface VerifyMobileRequest {
  mobile: string
}

interface VerifyEmailRequest {
  email: string
}

interface VerifyOtpRequest {
  email: string
  otp: string
}

interface PanVerificationRequest {
  panNumber: string
  name?: string
  dateOfBirth?: string
}

interface PanVerificationResponse {
  success: boolean
  message: string
  panHolderName: string
}

interface VerificationResponse {
  message: string
  isSubmitted?: boolean
  submissionMessage?: string
  currentStep?: number
  userData?: {
    email: string
    isEmailVerified: boolean
    panNumber?: string
    gstNumber?: string
    companyName?: string
    companyAddress?: string
    companyCity?: string
    companyState?: string
    aadharNumber?: string
  }
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
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    verifyMobile: builder.mutation<VerificationResponse, VerifyMobileRequest>({
      query: (credentials) => ({
        url: '/verify/mobile',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyEmail: builder.mutation<VerificationResponse, VerifyEmailRequest>({
      query: (credentials) => ({
        url: '/Account/verify-email',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyOtp: builder.mutation<VerificationResponse, VerifyOtpRequest>({
      query: (credentials) => ({
        url: '/Account/verify-otp',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyPan: builder.mutation<PanVerificationResponse, PanVerificationRequest>({
      query: (data) => ({
        url: '/PanVerification/verify',
        method: 'POST',
        body: data,
      }),
    }),
    validatePan: builder.query<{ name: string }, string>({
      query: (panNumber) => `/PanVerification/validate/${panNumber}`,
    }),
    submitEKYC: builder.mutation<void, EKYCRequest>({
      query: (data) => ({
        url: '/ekyc',
        method: 'POST',
        body: data,
      }),
    }),
    submitCompanyDetails: builder.mutation<void, CompanyDetailsRequest>({
      query: (data) => ({
        url: '/company-details',
        method: 'POST',
        body: data,
      }),
    }),
    submitDirectorDetails: builder.mutation<void, DirectorDetailsRequest>({
      query: (data) => ({
        url: '/director-details',
        method: 'POST',
        body: data,
      }),
    }),
    submitOnboarding: builder.mutation<void, void>({
      query: () => ({
        url: '/submit',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useVerifyMobileMutation,
  useVerifyEmailMutation,
  useVerifyOtpMutation,
  useVerifyPanMutation,
  useValidatePanQuery,
  useSubmitEKYCMutation,
  useSubmitCompanyDetailsMutation,
  useSubmitDirectorDetailsMutation,
  useSubmitOnboardingMutation,
} = onboardingApi 