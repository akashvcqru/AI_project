'use client'

import { Button, Card, Descriptions, message } from 'antd'
import { useState } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface ConfirmationProps {
  onNext: () => void
  onPrev: () => void
}

const ConfirmationSection = ({ onNext, onPrev }: ConfirmationProps) => {
  const { formData, resetProgress } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Prepare the comprehensive submission data for the backend
      const submissionData = {
        email: formData.email,
        companyName: formData.companyName,
        directorName: formData.name,
        panNumber: formData.panNumber,
        gstNumber: formData.gstNumber,
        aadharNumber: formData.aadharNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        designation: formData.designation,
        directorAddress: formData.directorAddress
      }

      console.log('Final submission data:', submissionData)

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/User/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        // Handle successful response
        const responseText = await response.text()
        let responseData = {}
        
        if (responseText) {
          try {
            responseData = JSON.parse(responseText)
          } catch (e) {
            // If response is not JSON, that's okay
            console.log('Non-JSON response received')
          }
        }
        
        message.success('Your request has been submitted and your documents are under process.')
        
        // Reset the form after successful submission
        setTimeout(() => {
          resetProgress()
          // The parent component will handle showing the success page
          onNext()
        }, 2000)
      } else {
        // Handle error response
        const responseText = await response.text()
        let errorData = { message: 'Submission failed' }
        
        if (responseText) {
          try {
            errorData = JSON.parse(responseText)
          } catch (e) {
            console.log('Non-JSON error response received')
          }
        }
        
        message.error(errorData.message || 'Submission failed')
      }
    } catch (error) {
      message.error('Submission failed. Please try again.')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileInfo = (file: any) => {
    if (!file) return 'Not uploaded'
    return file.name || 'File uploaded'
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Review Your Information</h2>
        <p style={{ color: '#666', margin: 0 }}>
          Please review all the information below before submitting your onboarding application.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Account Information */}
        <Card title="Account Information" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Email Address">{formData.email}</Descriptions.Item>
            <Descriptions.Item label="Email Status">
              <span style={{ color: formData.isEmailVerified ? '#52c41a' : '#ff4d4f' }}>
                {formData.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* eKYC Information */}
        <Card title="eKYC Information" size="small">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="PAN Number">{formData.panNumber}</Descriptions.Item>
            <Descriptions.Item label="PAN Holder Name">{formData.panHolderName || 'Not verified'}</Descriptions.Item>
            <Descriptions.Item label="GST Number">{formData.gstNumber}</Descriptions.Item>
            <Descriptions.Item label="PAN Card">{formatFileInfo(formData.panCard)}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Company Information */}
        <Card title="Company Information" size="small">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Company Name">{formData.companyName}</Descriptions.Item>
            <Descriptions.Item label="City">{formData.city}</Descriptions.Item>
            <Descriptions.Item label="State">{formData.state}</Descriptions.Item>
            <Descriptions.Item label="Pincode">{formData.pincode}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{formData.address}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Director Information */}
        <Card title="Director Information" size="small">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Full Name">{formData.name}</Descriptions.Item>
            <Descriptions.Item label="Designation">{formData.designation}</Descriptions.Item>
            <Descriptions.Item label="Aadhar Number">{formData.aadharNumber}</Descriptions.Item>
            <Descriptions.Item label="Photo">{formatFileInfo(formData.photo)}</Descriptions.Item>
            <Descriptions.Item label="Signature">{formatFileInfo(formData.signature)}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{formData.directorAddress}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      {/* Action Buttons */}
      <div style={{
        marginTop: '32px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        background: '#f8fafc',
        borderRadius: '8px'
      }}>
        <Button size="large" onClick={onPrev}>
          Previous
        </Button>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
            By submitting, you agree to our terms and conditions
          </p>
          <Button 
            type="primary" 
            size="large"
            loading={isSubmitting}
            onClick={handleFinalSubmit}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              height: '48px',
              paddingLeft: '32px',
              paddingRight: '32px',
              fontSize: '16px'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationSection 