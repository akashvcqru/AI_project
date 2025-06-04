'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useVerifyEmailMutation, useVerifyOtpMutation } from '@/store/services/onboardingApi'
import { useAppDispatch } from '@/store/hooks'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface AccountVerificationProps {
  onNext: () => void
  onPrev: () => void
}

const AccountVerification = ({ onNext, onPrev }: AccountVerificationProps) => {
  const [form] = Form.useForm()
  const [verifyEmail, { isLoading: isEmailLoading }] = useVerifyEmailMutation()
  const [verifyOtp, { isLoading: isOtpLoading }] = useVerifyOtpMutation()
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [isNewVerification, setIsNewVerification] = useState(false)
  const dispatch = useAppDispatch()
  
  // Global form state
  const { formData, updateFormData, loadProgress, goToStep, saveProgress, currentStep } = useOnboarding()

  // Pre-fill email from global state
  useEffect(() => {
    if (formData.email) {
      form.setFieldsValue({ email: formData.email })
    }
    if (formData.isEmailVerified) {
      setIsEmailVerified(true)
    }
  }, [form, formData.email, formData.isEmailVerified])

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const startCountdown = () => {
    setCountdown(30)
    setCanResend(false)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    updateFormData('email', email)
    form.setFieldsValue({ email })
  }

  const handleEmailVerification = async () => {
    try {
      const values = await form.validateFields(['email'])
      updateFormData('email', values.email)
      await verifyEmail(values).unwrap()
      setIsOtpSent(true)
      startCountdown()
      message.success('OTP sent successfully to your email')
    } catch (error) {
      message.error('Failed to send OTP')
    }
  }

  const handleResendOtp = async () => {
    try {
      const values = await form.validateFields(['email'])
      await verifyEmail(values).unwrap()
      startCountdown()
      message.success('OTP resent successfully to your email')
    } catch (error) {
      message.error('Failed to resend OTP')
    }
  }

  const handleOtpVerification = async () => {
    try {
      const values = await form.validateFields(['email', 'otp'])
      await verifyOtp(values).unwrap()
      setIsEmailVerified(true)
      setIsNewVerification(true)
      updateFormData('isEmailVerified', true)
      setCountdown(0)
      setCanResend(true)
      message.success('Email verified successfully')
      
      // Save progress immediately after email verification
      setTimeout(() => {
        saveProgress()
      }, 100)
    } catch (error) {
      message.error('Invalid OTP. Please try again.')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (!isEmailVerified) {
        message.error('Please verify your email first')
        return
      }
      
      updateFormData('email', values.email)
      updateFormData('isEmailVerified', true)
      
      // If email is already verified, just proceed to next step
      // This handles both: fresh completion and navigation back from later steps
      if (isEmailVerified) {
        onNext()
        return
      }
      
      // This code should never be reached since we check isEmailVerified above,
      // but keeping it as fallback for edge cases
      message.success('Email verified successfully!')
      onNext()
    } catch (error) {
      message.error('Verification failed. Please try again.')
    }
  }

  // Function to render the email input suffix button
  const renderEmailSuffixButton = () => {
    if (isEmailVerified) {
      return (
        <Button type="link" disabled>
          Verified
        </Button>
      )
    }

    if (!isOtpSent) {
      return (
        <Button
          type="link"
          onClick={handleEmailVerification}
          disabled={isEmailLoading}
          loading={isEmailLoading}
        >
          Send OTP
        </Button>
      )
    }

    return (
      <Button
        type="link"
        onClick={handleResendOtp}
        disabled={!canResend || isEmailLoading}
        loading={isEmailLoading && !canResend}
      >
        {canResend ? 'Resend OTP' : `Resend (${countdown}s)`}
      </Button>
    )
  }

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className="max-w-md mx-auto"
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email address' }
        ]}
      >
        <Input
          placeholder="Enter your email"
          disabled={isEmailVerified}
          value={formData.email}
          onChange={handleEmailChange}
          suffix={renderEmailSuffixButton()}
        />
      </Form.Item>

      {isOtpSent && !isEmailVerified && (
        <Form.Item
          name="otp"
          label="OTP"
          rules={[
            { required: true, message: 'Please input the OTP!' },
            { len: 6, message: 'OTP must be 6 digits' }
          ]}
        >
          <Input
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            suffix={
              <Button
                type="link"
                onClick={handleOtpVerification}
                loading={isOtpLoading}
                disabled={isOtpLoading}
              >
                Verify OTP
              </Button>
            }
          />
        </Form.Item>
      )}

      <div className="flex justify-end gap-4">
        <Button type="primary" htmlType="submit" disabled={!isEmailVerified}>
          Continue
        </Button>
      </div>
    </Form>
  )
}

export default AccountVerification 