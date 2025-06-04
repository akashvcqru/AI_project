import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OnboardingState {
  currentStep: number
  formData: {
    account?: {
      email: string
    }
    ekyc?: {
      panNumber: string
      gstNumber: string
    }
    company?: {
      name: string
      category: string
      websiteUrl: string
      country: string
      state: string
      city: string
      address: string
    }
    director?: {
      aadharNumber: string
      panNumber: string
    }
  }
}

const initialState: OnboardingState = {
  currentStep: 0,
  formData: {},
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    updateFormData: (state, action: PayloadAction<Partial<OnboardingState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    resetOnboarding: (state) => {
      state.currentStep = 0
      state.formData = {}
    },
  },
})

export const { setStep, updateFormData, resetOnboarding } = onboardingSlice.actions
export default onboardingSlice.reducer 