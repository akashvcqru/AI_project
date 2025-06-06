'use client'

import { Button, Card, Descriptions, message, Checkbox } from 'antd'
import React, { useState } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'
import { EditOutlined } from '@ant-design/icons'

interface ConfirmationProps {
  onNext: () => void
  onPrev: () => void
}

const ConfirmationSection = ({ onNext, onPrev }: ConfirmationProps) => {
  const { formData, resetProgress, goToStep } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [directorDetailsConfirmed, setDirectorDetailsConfirmed] = useState(false)

  const handleEditSection = (section: string) => {
    switch(section) {
      case 'account':
        goToStep(0) // Account Verification
        break;
      case 'ekyc':
        goToStep(1) // eKYC
        break;
      case 'company':
        goToStep(2) // Company Details
        break;
      case 'director':
        goToStep(3) // Director Details
        break;
    }
  }

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
    if (typeof file === 'string') return file
    return file.name || 'Uploaded'
  }

  const renderCardTitle = (title: string, section: string) => (
    <div className="flex justify-between items-center">
      <span>{title}</span>
      <Button 
        type="link" 
        icon={<EditOutlined />} 
        onClick={() => handleEditSection(section)}
        className="p-0 h-auto"
      >
        Edit
      </Button>
    </div>
  )

  return (
    <React.Fragment>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Review Your Information
        </h1>
        <p className="text-gray-600">
          Please review all the information below before submitting your onboarding application.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Information */}
        <Card 
          title={renderCardTitle("Account Information", "account")} 
          size="small"
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Email Address">{formData.email}</Descriptions.Item>
            <Descriptions.Item label="Email Status">
              <span className={formData.isEmailVerified ? 'text-green-500' : 'text-red-500'}>
                {formData.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Mobile Number">{formData.mobileNumber}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* eKYC Information */}
        <Card 
          title={renderCardTitle("eKYC Information", "ekyc")} 
          size="small"
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="GST Number">{formData.gstNumber}</Descriptions.Item>
            <Descriptions.Item label="GST Certificate">{formatFileInfo(formData.gstDocument)}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Company Information */}
        <Card 
          title={renderCardTitle("Company Information", "company")} 
          size="small"
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Company Name">{formData.companyName}</Descriptions.Item>
            <Descriptions.Item label="City">{formData.city}</Descriptions.Item>
            <Descriptions.Item label="State">{formData.state}</Descriptions.Item>
            <Descriptions.Item label="Pincode">{formData.pincode}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{formData.address}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Director Information */}
        <Card 
          title={renderCardTitle("Director Information", "director")} 
          size="small"
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Full Name">{formData.name}</Descriptions.Item>
            <Descriptions.Item label="Designation">{formData.designation}</Descriptions.Item>
            <Descriptions.Item label="Aadhar Number">{formData.aadharNumber}</Descriptions.Item>
            <Descriptions.Item label="Photo">{formatFileInfo(formData.photo)}</Descriptions.Item>
            <Descriptions.Item label="Signature">{formatFileInfo(formData.signature)}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{formData.directorAddress}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Confirmation Checkboxes */}
        <Card size="small">
          <div className="space-y-4">
            <Checkbox
              checked={directorDetailsConfirmed}
              onChange={(e) => setDirectorDetailsConfirmed(e.target.checked)}
              className="text-gray-600"
            >
              I confirm that all the director information provided above is accurate and complete
            </Checkbox>
            
            <div className="border-t border-gray-100 pt-4">
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="text-gray-600"
              >
                By submitting, you agree to our{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  terms and conditions
                </a>
              </Checkbox>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center items-center p-6 bg-slate-50 rounded-lg">
          <div className="text-center">
            <Button 
              type="primary" 
              size="large"
              loading={isSubmitting}
              onClick={handleFinalSubmit}
              disabled={!termsAccepted || !directorDetailsConfirmed}
              className={`bg-gradient-to-r from-indigo-500 to-purple-600 border-none px-10 text-base ${
                (!termsAccepted || !directorDetailsConfirmed) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ConfirmationSection 