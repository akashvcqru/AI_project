'use client'

import { useState, useEffect } from 'react'
import { Steps, Card, Spin, Typography, Space, Row, Col } from 'antd'
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext'
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

  const handleRestart = () => {
    // Implement the logic to reset the onboarding process
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <Card className="border-b border-gray-100 shadow-sm rounded-none">
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <div className="relative w-10 h-10">
                <img
                  src="https://www.vcqru.com/newContent/front-assets/img/vcqru-logo.png"
                  alt="VCQRU Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} className="!mb-0 !text-gray-800 font-semibold">
                  VCQRU Onboarding
                </Title>
                <Text className="text-xs text-gray-500">
                  Complete your company registration
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space className="bg-blue-50 px-4 py-2 rounded-full">
              <div className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-medium">
                {currentStep + 1}
              </div>
              <Text className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Space direction="vertical" size="middle" className="w-full">
          {/* Steps Navigation */}
          <Card bodyStyle={{ padding: '16px 24px' }}>
            <Steps
              current={currentStep}
              items={steps.map(item => ({
                title: item.title,
                description: item.description,
                icon: item.icon,
              }))}
              className="[&_.ant-steps-item-icon]:bg-white [&_.ant-steps-item-icon]:border-blue-500 [&_.ant-steps-item-active_.ant-steps-item-icon]:bg-blue-500 [&_.ant-steps-item-finish_.ant-steps-item-icon]:border-green-500 [&_.ant-steps-item-finish_.ant-steps-item-icon_.ant-steps-icon]:text-green-500 [&_.ant-steps-item-title]:text-sm [&_.ant-steps-item-title]:leading-tight [&_.ant-steps-item-description]:text-xs [&_.ant-steps-item-description]:text-gray-500"
            />
          </Card>

          {/* Form Container */}
          <Card 
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
            bodyStyle={{ padding: '24px' }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <div>
                {currentStep === 0 && (
                  <AccountVerification onNext={nextStep} onPrev={() => {}} />
                )}
                {currentStep === 1 && (
                  <EKYCForm onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 2 && (
                  <CompanyDetailsForm onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 3 && (
                  <DirectorDetailsForm onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 4 && (
                  <ConfirmationSection onNext={handleConfirmationNext} onPrev={prevStep} />
                )}
                {currentStep === 5 && (
                  <SubmissionSuccess onPrev={handleRestart} />
                )}
              </div>
            )}
          </Card>

          {/* Footer */}
          <Card bodyStyle={{ padding: '12px 24px' }}>
            <Text className="text-center block text-sm text-gray-500">
              Need help? Contact support at{' '}
              <a 
                href="mailto:support@vcqru.com" 
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                support@vcqru.com
              </a>
            </Text>
          </Card>
        </Space>
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