'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, message, Alert } from 'antd'
import { useAppDispatch } from '@/store/hooks'
import { useOnboarding } from '../../contexts/OnboardingContext'
import SubmissionSuccess from './SubmissionSuccess'

// Add API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface AccountVerificationProps {
  onNext: () => void
  onPrev: () => void
  onAlreadySubmitted?: () => void
}

const AccountVerification = ({ onNext, onPrev, onAlreadySubmitted }: AccountVerificationProps) => {
  const [form] = Form.useForm()
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isOtpLoading, setIsOtpLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [isNewVerification, setIsNewVerification] = useState(false)
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const dispatch = useAppDispatch()
  
  // Global form state
  const { formData, updateFormData, loadProgress, goToStep, saveProgress, currentStep, updateMultipleFields } = useOnboarding()

  // Pre-fill email from global state
  useEffect(() => {
    if (formData.email) {
      form.setFieldsValue({ email: formData.email })
    }
    if (formData.mobileNumber) {
      form.setFieldsValue({ mobileNumber: formData.mobileNumber })
    }
    if (formData.isEmailVerified) {
      setIsEmailVerified(true)
    }
  }, [form, formData.email, formData.mobileNumber, formData.isEmailVerified])

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

  const checkUserProgress = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/User/check-progress/${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.isSubmitted) {
        setIsAlreadySubmitted(true)
        setSubmissionMessage(data.message)
        if (onAlreadySubmitted) {
          onAlreadySubmitted()
        } else {
          window.dispatchEvent(new Event('showSubmissionSuccess'))
        }
        return true
      }
      
      if (data.exists && data.currentStep > 0) {
        // Load user data into form
        if (data.userData) {
          const updates: any = {}
          if (data.userData.email) updates.email = data.userData.email
          if (data.userData.isEmailVerified) updates.isEmailVerified = data.userData.isEmailVerified
          if (data.userData.mobileNumber) updates.mobileNumber = data.userData.mobileNumber
          if (data.userData.panNumber) updates.panNumber = data.userData.panNumber
          if (data.userData.gstNumber) updates.gstNumber = data.userData.gstNumber
          if (data.userData.companyName) updates.companyName = data.userData.companyName
          if (data.userData.companyAddress) updates.address = data.userData.companyAddress
          if (data.userData.companyCity) updates.city = data.userData.companyCity
          if (data.userData.companyState) updates.state = data.userData.companyState
          if (data.userData.aadharNumber) updates.aadharNumber = data.userData.aadharNumber
          
          updateMultipleFields(updates)
          // Set form values after updating the global state
          form.setFieldsValue({
            email: data.userData.email,
            mobileNumber: data.userData.mobileNumber
          })
        }
        
        // Navigate to the appropriate step
        setTimeout(() => {
          goToStep(data.currentStep)
        }, 1000)
        
        message.info(`Welcome back! Resuming from where you left off...`)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking user progress:', error)
      return false
    }
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
      
      // Check if user has already submitted or has progress
      const hasProgress = await checkUserProgress(values.email)
      if (hasProgress) {
        return // Don't send OTP if user is already submitted or being redirected
      }
      
      setIsEmailLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/Account/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies if needed
        body: JSON.stringify({ email: values.email }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setIsOtpSent(true)
      startCountdown()
      message.success('OTP sent successfully to your email')
      
    } catch (error: any) {
      console.error('Email verification error:', error)
      message.error(error.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const values = await form.validateFields(['email'])
      setIsEmailLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/api/Account/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies if needed
        body: JSON.stringify({ email: values.email }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      startCountdown()
      message.success('OTP resent successfully to your email')
      
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      message.error(error.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    try {
      const values = await form.validateFields(['email', 'otp'])
      setIsOtpLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/api/Account/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: values.email,
          otp: values.otp 
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setIsEmailVerified(true)
      setIsNewVerification(true)
      setCountdown(0)
      setCanResend(true)
      message.success('Email verified successfully')
      
      // Update form data
      updateFormData('isEmailVerified', true)
      
      // If user has already submitted, show submission success
      if (data.isSubmitted) {
        setIsAlreadySubmitted(true)
        setSubmissionMessage(data.submissionMessage || 'Your application has already been submitted')
        if (onAlreadySubmitted) {
          onAlreadySubmitted()
        } else {
          window.dispatchEvent(new Event('showSubmissionSuccess'))
        }
        return
      }
      
      // Update user data if available
      if (data.userData) {
        const updates: any = {}
        if (data.userData.email) updates.email = data.userData.email
        if (data.userData.isEmailVerified) updates.isEmailVerified = data.userData.isEmailVerified
        if (data.userData.mobileNumber) updates.mobileNumber = data.userData.mobileNumber
        if (data.userData.panNumber) updates.panNumber = data.userData.panNumber
        if (data.userData.gstNumber) updates.gstNumber = data.userData.gstNumber
        if (data.userData.companyName) updates.companyName = data.userData.companyName
        if (data.userData.companyAddress) updates.address = data.userData.companyAddress
        if (data.userData.companyCity) updates.city = data.userData.companyCity
        if (data.userData.companyState) updates.state = data.userData.companyState
        if (data.userData.aadharNumber) updates.aadharNumber = data.userData.aadharNumber
        
        updateMultipleFields(updates)
      }
      
      // Remove automatic navigation to next step
      // Only save progress
      setTimeout(() => {
        saveProgress()
      }, 100)
      
    } catch (error: any) {
      console.error('OTP verification error:', error)
      message.error(error.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsOtpLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (!isEmailVerified) {
        message.error('Please verify your email first')
        return
      }

      if (!values.mobileNumber) {
        message.error('Please enter your mobile number')
        return
      }
      
      // Update both email and mobile number
      updateFormData('email', values.email)
      updateFormData('mobileNumber', values.mobileNumber)
      updateFormData('isEmailVerified', true)
      
      // Save progress before moving to next step
      await saveProgress()

      // Send submission confirmation email
      try {
        console.log('Attempting to send email to:', values.email);
        const emailResponse = await fetch(`${API_BASE_URL}/api/Account/send-submission-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: values.email,
            template: 'submission_confirmation'
          }),
        });

        const responseData = await emailResponse.json().catch(() => ({}));
        console.log('Email API Response:', {
          status: emailResponse.status,
          ok: emailResponse.ok,
          data: responseData
        });

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation email:', {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error: responseData.message || 'Unknown error'
          });
          message.error('Failed to send confirmation email. Please contact support.');
        } else {
          console.log('Email sent successfully to:', values.email);
          message.success('A confirmation email has been sent to your registered email address');
        }
      } catch (emailError: any) {
        console.error('Error sending confirmation email:', {
          error: emailError.message,
          stack: emailError.stack,
          email: values.email
        });
        message.error('Failed to send confirmation email. Please contact support.');
      }
      
      // Now proceed to next step
      onNext()
    } catch (error) {
      console.error('Submit error:', error)
      message.error('Failed to proceed. Please try again.')
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
        disabled={!canResend || countdown > 0}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
      </Button>
    )
  }

  // If user has already submitted, show the SubmissionSuccess component
  if (isAlreadySubmitted) {
    return <SubmissionSuccess />
  }

  return (
    <div>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
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
            label="Email Verification OTP"
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

        <Form.Item
          name="mobileNumber"
          label="Mobile Number"
          rules={[
            { required: true, message: 'Please input your mobile number!' },
            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number' }
          ]}
        >
          <Input
            placeholder="Enter your mobile number"
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              updateFormData('mobileNumber', value)
              form.setFieldsValue({ mobileNumber: value })
            }}
            value={formData.mobileNumber}
          />
        </Form.Item>

        <div className="flex justify-end gap-4">
          <Button 
            type="primary" 
            htmlType="submit" 
            disabled={!isEmailVerified}
          >
            Submit & Continue
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default AccountVerification 