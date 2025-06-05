'use client'

import { useState, useEffect } from 'react'
import { Steps, Card, Spin, Typography } from 'antd'
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext'
import AccountVerification from '@/components/onboarding/AccountVerification'
import EKYCForm from '@/components/onboarding/EKYCForm'
import CompanyDetailsForm from '@/components/onboarding/CompanyDetailsForm'
import DirectorDetailsForm from '@/components/onboarding/DirectorDetailsForm'
import ConfirmationSection from '../../components/onboarding/ConfirmationSection'
import SubmissionSuccess from '@/components/onboarding/SubmissionSuccess'

const { Title } = Typography

const OnboardingContent = () => {
  const { currentStep, isLoading, nextStep, prevStep, isStepCompleted } = useOnboarding()
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false)

  // Check if we need to show submission success from AccountVerification
  useEffect(() => {
    // Listen for a custom event that AccountVerification can trigger
    const handleShowSubmissionSuccess = () => {
      setIsAlreadySubmitted(true)
    }
    
    window.addEventListener('showSubmissionSuccess', handleShowSubmissionSuccess)
    
    return () => {
      window.removeEventListener('showSubmissionSuccess', handleShowSubmissionSuccess)
    }
  }, [])

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

  const handleConfirmationNext = () => {
    setShowSuccess(true)
  }

  if (isAlreadySubmitted) {
    return <SubmissionSuccess />
  }

  if (showSuccess) {
    return <SubmissionSuccess />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img
              src="https://www.vcqru.com/newContent/front-assets/img/vcqru-logo.png"
              alt="VCQRU Logo"
              style={{height: '5rem' }}
            />
          </div>
          <Title level={2} className="text-gray-800 mb-2">Welcome to VCQRU</Title>
          <p className="text-gray-600 text-lg">Complete your company registration process</p>
        </div>

        <Card className="shadow-lg">
          <Steps
            current={currentStep}
            items={steps.map(item => ({ title: item.title }))}
            className="mb-8"
          />
          
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              <div>
                {currentStep === 0 && <AccountVerification onNext={nextStep} onPrev={() => {}} />}
                {currentStep === 1 && <EKYCForm onNext={nextStep} onPrev={prevStep} />}
                {currentStep === 2 && <CompanyDetailsForm onNext={nextStep} onPrev={prevStep} />}
                {currentStep === 3 && <DirectorDetailsForm onNext={nextStep} onPrev={prevStep} />}
                {currentStep === 4 && <ConfirmationSection onNext={handleConfirmationNext} onPrev={prevStep} />}
              </div>
            )}
          </div>
        </Card>
      </div>
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