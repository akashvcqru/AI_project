import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OnboardingFormData {
  // Account Verification
  email: string
  isEmailVerified: boolean
  mobileNumber: string
  
  // eKYC Details
  gstNumber: string
  gstDocument: any
  tradeName: string
  
  // Company Details
  companyName: string
  address: string
  city: string
  state: string
  pincode: string
  
  // Director Details
  name: string
  panNumber: string
  isPanVerified: boolean
  panDocument: any
  aadharNumber: string
  designation: string
  directorAddress: string
  photo: any
  signature: any
}

interface OnboardingState {
  formData: OnboardingFormData
  currentStep: number
  isLoading: boolean
}

const initialFormData: OnboardingFormData = {
  // Account Verification
  email: '',
  isEmailVerified: false,
  mobileNumber: '',
  
  // eKYC Details
  gstNumber: '',
  gstDocument: null,
  tradeName: '',
  
  // Company Details
  companyName: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  
  // Director Details
  name: '',
  panNumber: '',
  isPanVerified: false,
  panDocument: null,
  aadharNumber: '',
  designation: '',
  directorAddress: '',
  photo: null,
  signature: null
}

const initialState: OnboardingState = {
  formData: initialFormData,
  currentStep: 0,
  isLoading: true
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateFormField: (state, action: PayloadAction<{ field: keyof OnboardingFormData; value: any }>) => {
      const { field, value } = action.payload
      state.formData[field] = value
    },
    updateMultipleFields: (state, action: PayloadAction<Partial<OnboardingFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    nextStep: (state) => {
      state.currentStep = Math.min(state.currentStep + 1, 4)
    },
    prevStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 0)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    resetForm: (state) => {
      state.formData = initialFormData
      state.currentStep = 0
    }
  }
})

export const {
  updateFormField,
  updateMultipleFields,
  setCurrentStep,
  nextStep,
  prevStep,
  setLoading,
  resetForm
} = onboardingSlice.actions

export default onboardingSlice.reducer 