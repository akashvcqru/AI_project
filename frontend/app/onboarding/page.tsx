'use client'

import { useState } from 'react'
import { Steps, Card, Spin } from 'antd'
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext'
import AccountVerification from '@/components/onboarding/AccountVerification'
import EKYCForm from '@/components/onboarding/EKYCForm'
import CompanyDetailsForm from '@/components/onboarding/CompanyDetailsForm'
import DirectorDetailsForm from '@/components/onboarding/DirectorDetailsForm'
import ConfirmationSection from '../../components/onboarding/ConfirmationSection'

const OnboardingContent = () => {
  const { currentStep, isLoading, nextStep, prevStep, isStepCompleted } = useOnboarding()

  const steps = [
    {
      title: 'Account Verification',
      content: AccountVerification,
    },
    {
      title: 'eKYC',
      content: EKYCForm,
    },
    {
      title: 'Company Details',
      content: CompanyDetailsForm,
    },
    {
      title: 'Director Details',
      content: DirectorDetailsForm,
    },
    {
      title: 'Confirmation',
      content: ConfirmationSection,
    },
  ]

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return isStepCompleted(stepIndex) ? 'finish' : 'error'
    }
    if (stepIndex === currentStep) {
      return 'process'
    }
    return 'wait'
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px' 
          }}>
            <Spin size="large" />
          </div>
        </Card>
      </div>
    )
  }

  const CurrentStepComponent = steps[currentStep].content

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <Steps
          current={currentStep}
          items={steps.map((item, index) => ({ 
            title: item.title,
            status: getStepStatus(index)
          }))}
          className="mb-8"
        />
        <div className="min-h-[400px]">
          <CurrentStepComponent onNext={nextStep} onPrev={prevStep} />
        </div>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
} 