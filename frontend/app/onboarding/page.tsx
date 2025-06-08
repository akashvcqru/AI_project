'use client'

import { useState, useEffect } from 'react'
import { Steps, Card, Spin, Typography, Space, Row, Col } from 'antd'
import { useOnboarding } from '@/app/store/hooks/useOnboarding'
import AccountVerification from '@/components/onboarding/AccountVerification'
import EKYCForm from '@/components/onboarding/EKYCForm'
import CompanyDetailsForm from '@/components/onboarding/CompanyDetailsForm'
import DirectorDetailsForm from '@/components/onboarding/DirectorDetailsForm'
import ConfirmationSection from '@/components/onboarding/ConfirmationSection'
import SubmissionSuccess from '@/components/onboarding/SubmissionSuccess'
import Image from 'next/image'
import { UserOutlined, LockOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const OnboardingContent = () => {
  const { currentStep, isLoading, nextStep, prevStep, isStepCompleted } = useOnboarding()
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false)

  // Check if we need to show submission success from AccountVerification
  useEffect(() => {
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
      description: 'Verify Your Account',
      icon: <SafetyOutlined />,
    },
    {
      title: 'E-KYC',
      description: 'Identity Verification',
      icon: <UserOutlined />,
    },
    {
      title: 'Company Details',
      description: 'Business Information',
      icon: <LockOutlined />,
    },
    {
      title: 'Director Details',
      description: 'Management Information',
      icon: <UserOutlined />,
    },
    {
      title: 'Confirmation',
      description: 'Review & Submit',
      icon: <CheckCircleOutlined />,
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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <Title level={2}>Company Onboarding</Title>
          <Text type="secondary">
            Complete the following steps to register your company
          </Text>
        </div>

        <Card className="mb-8">
          <Steps
            current={currentStep}
            items={steps}
            progressDot
            className="mb-8"
          />

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Loading your progress...</p>
            </div>
          ) : (
            <div className="mt-8">
              {currentStep === 0 && (
                <AccountVerification
                  onNext={nextStep}
                  onPrev={prevStep}
                  onAlreadySubmitted={() => setIsAlreadySubmitted(true)}
                />
              )}
              {currentStep === 1 && (
                <EKYCForm
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 2 && (
                <CompanyDetailsForm
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 3 && (
                <DirectorDetailsForm
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 4 && (
                <ConfirmationSection
                  onNext={handleConfirmationNext}
                  onPrev={prevStep}
                />
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return <OnboardingContent />
} 