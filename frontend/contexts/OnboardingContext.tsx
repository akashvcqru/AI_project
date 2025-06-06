'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface FormData {
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
  aadharNumber: string
  designation: string
  directorAddress: string
  photo: any
  signature: any
}

interface OnboardingContextType {
  formData: FormData
  currentStep: number
  isLoading: boolean
  updateFormData: (field: keyof FormData, value: any) => void
  updateMultipleFields: (fields: Partial<FormData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  saveProgress: () => void
  loadProgress: () => Promise<boolean>
  resetProgress: () => void
  isStepCompleted: (step: number) => boolean
}

const initialFormData: FormData = {
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
  aadharNumber: '',
  designation: '',
  directorAddress: '',
  photo: null,
  signature: null
}

const STORAGE_KEY = 'onboarding_progress'

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const hasProgress = await loadProgress()
        if (!hasProgress) {
          // No saved progress, start fresh
          setCurrentStep(0)
        }
      } catch (error) {
        console.error('Error loading progress:', error)
        setCurrentStep(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedProgress()
  }, [])

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-save progress when form data changes
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          formData: newData,
          currentStep,
          timestamp: Date.now()
        }))
      }, 100)
      
      return newData
    })
  }, [currentStep])

  const updateMultipleFields = useCallback((fields: Partial<FormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...fields }
      
      // Auto-save progress when form data changes
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          formData: newData,
          currentStep,
          timestamp: Date.now()
        }))
      }, 100)
      
      return newData
    })
  }, [currentStep])

  const nextStep = useCallback(() => {
    const newStep = Math.min(currentStep + 1, 4) // Max 5 steps (0-4)
    setCurrentStep(newStep)
    saveProgressWithStep(newStep)
  }, [currentStep])

  const prevStep = useCallback(() => {
    const newStep = Math.max(currentStep - 1, 0)
    setCurrentStep(newStep)
    saveProgressWithStep(newStep)
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 4) {
      setCurrentStep(step)
      saveProgressWithStep(step)
    }
  }, [])

  const saveProgressWithStep = (step: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData,
      currentStep: step,
      timestamp: Date.now()
    }))
  }

  const saveProgress = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData,
      currentStep,
      timestamp: Date.now()
    }))
  }, [formData, currentStep])

  const loadProgress = useCallback(async (): Promise<boolean> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return false

      const { formData: savedFormData, currentStep: savedStep, timestamp } = JSON.parse(saved)
      
      // Check if saved data is not too old (e.g., 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      if (timestamp < sevenDaysAgo) {
        localStorage.removeItem(STORAGE_KEY)
        return false
      }

      // Only resume if email is verified
      if (savedFormData.isEmailVerified) {
        setFormData(savedFormData)
        setCurrentStep(savedStep)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error loading progress:', error)
      localStorage.removeItem(STORAGE_KEY)
      return false
    }
  }, [])

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setFormData(initialFormData)
    setCurrentStep(0)
  }, [])

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

  // Auto-save when step changes
  useEffect(() => {
    if (!isLoading) {
      saveProgress()
    }
  }, [currentStep, saveProgress, isLoading])

  const value: OnboardingContextType = {
    formData,
    currentStep,
    isLoading,
    updateFormData,
    updateMultipleFields,
    nextStep,
    prevStep,
    goToStep,
    saveProgress,
    loadProgress,
    resetProgress,
    isStepCompleted
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
} 