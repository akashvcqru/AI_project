import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import {
  updateFormField,
  updateMultipleFields,
  setCurrentStep,
  nextStep,
  prevStep,
  setLoading,
  resetForm,
  type OnboardingFormData
} from '../slices/onboardingSlice'

export const useOnboarding = () => {
  const dispatch = useDispatch()
  const { formData, currentStep, isLoading } = useSelector((state: RootState) => state.onboarding)

  const updateField = useCallback((field: keyof OnboardingFormData, value: any) => {
    dispatch(updateFormField({ field, value }))
  }, [dispatch])

  const updateFields = useCallback((fields: Partial<OnboardingFormData>) => {
    dispatch(updateMultipleFields(fields))
  }, [dispatch])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 4) {
      dispatch(setCurrentStep(step))
    }
  }, [dispatch])

  const handleNext = useCallback(() => {
    dispatch(nextStep())
  }, [dispatch])

  const handlePrev = useCallback(() => {
    dispatch(prevStep())
  }, [dispatch])

  const setLoadingState = useCallback((loading: boolean) => {
    dispatch(setLoading(loading))
  }, [dispatch])

  const handleReset = useCallback(() => {
    dispatch(resetForm())
  }, [dispatch])

  const isStepCompleted = useCallback((step: number) => {
    switch (step) {
      case 0: // Account Verification
        return formData.email && formData.isEmailVerified
      case 1: // eKYC
        return formData.gstNumber && formData.gstDocument
      case 2: // Company Details
        return formData.companyName && formData.address && formData.city && formData.state && formData.pincode
      case 3: // Director Details
        return formData.name && formData.aadharNumber && formData.designation && formData.directorAddress
      case 4: // Confirmation
        return true
      default:
        return false
    }
  }, [formData])

  return {
    formData,
    currentStep,
    isLoading,
    updateFormData: updateField,
    updateMultipleFields: updateFields,
    nextStep: handleNext,
    prevStep: handlePrev,
    goToStep,
    setLoading: setLoadingState,
    resetProgress: handleReset,
    isStepCompleted
  }
} 