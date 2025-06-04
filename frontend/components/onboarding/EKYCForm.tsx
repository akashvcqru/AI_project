import { Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { useState, useEffect, useCallback } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'
import debounce from 'lodash/debounce'

interface EKYCFormProps {
  onNext: () => void
  onPrev: () => void
}

const EKYCForm = ({ onNext, onPrev }: EKYCFormProps) => {
  const { formData, updateFormData, saveProgress } = useOnboarding()
  const [form] = Form.useForm()
  const [isPanValidating, setIsPanValidating] = useState(false)

  // Pre-fill form with existing data
  useEffect(() => {
    form.setFieldsValue({
      panNumber: formData.panNumber,
      gstNumber: formData.gstNumber
    })
  }, [form, formData.panNumber, formData.gstNumber])

  // Debounced PAN validation function
  const debouncedValidatePan = useCallback(
    debounce(async (panNumber: string) => {
      if (panNumber.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
        setIsPanValidating(true)
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`http://localhost:5000/api/PanVerification/validate/${panNumber}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          })

          if (response.ok) {
            const data = await response.json()
            console.log('PAN validation response:', data)
            if (data.success && data.name) {
              updateFormData('panHolderName', data.name)
              message.success(`PAN verified: ${data.name}`)
            } else {
              updateFormData('panHolderName', '')
              message.error(data.message || 'Invalid PAN number')
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            updateFormData('panHolderName', '')
            message.error(errorData.message || 'Failed to validate PAN number')
          }
        } catch (error) {
          updateFormData('panHolderName', '')
          message.error('Error validating PAN number')
          console.error('PAN validation error:', error)
        } finally {
          setIsPanValidating(false)
        }
      } else if (panNumber.length === 0) {
        // Reset when PAN is cleared
        updateFormData('panHolderName', '')
      }
    }, 500),
    [updateFormData]
  )

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    updateFormData('panNumber', value)
    form.setFieldsValue({ panNumber: value })
    
    // Reset PAN holder name when user is typing
    if (formData.panHolderName && value !== formData.panNumber) {
      updateFormData('panHolderName', '')
    }
    
    // Trigger validation
    debouncedValidatePan(value)
  }

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    updateFormData('gstNumber', value)
    form.setFieldsValue({ gstNumber: value })
  }

  const handleSubmit = async (values: any) => {
    try {
      // Update form data with current values
      updateFormData('panNumber', values.panNumber)
      updateFormData('gstNumber', values.gstNumber)
      
      // Save progress
      saveProgress()
      
      message.success('eKYC details submitted successfully!')
      onNext()
    } catch (error) {
      message.error('Submission failed. Please try again.')
    }
  }

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      onSuccess(result, file)
      message.success(`${file.name} uploaded successfully`)
    } catch (error: any) {
      onError(error)
      message.error(`Upload failed: ${error.message}`)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    customRequest: customUpload,
    beforeUpload: (file) => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      if (!isValidType) {
        message.error('You can only upload JPG, PNG or PDF files!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('File must be smaller than 2MB!')
        return false
      }
      return true
    },
    onChange(info) {
      if (info.file.status === 'done') {
        updateFormData('panCard', info.file)
      } else if (info.file.status === 'removed') {
        updateFormData('panCard', null)
      }
    },
    maxCount: 1,
    listType: 'text',
    defaultFileList: formData.panCard ? [formData.panCard] : []
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="panNumber"
        label="PAN Number"
        rules={[
          { required: true, message: 'Please input your PAN number!' },
          { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Please enter a valid PAN number' }
        ]}
        extra={formData.panHolderName && (
          <div style={{ color: '#52c41a', marginTop: '4px' }}>
            ✓ PAN Holder: {formData.panHolderName}
          </div>
        )}
      >
        <Input 
          placeholder="Enter your PAN number (e.g., IPMPK2705D)" 
          style={{ textTransform: 'uppercase' }} 
          value={formData.panNumber}
          onChange={handlePanChange}
          suffix={isPanValidating && <span style={{ color: '#1890ff' }}>Validating...</span>}
        />
      </Form.Item>

      <Form.Item
        name="gstNumber"
        label="GST Number"
        rules={[
          { required: true, message: 'Please input your GST number!' },
          { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter a valid GST number' }
        ]}
      >
        <Input 
          placeholder="Enter your GST number" 
          style={{ textTransform: 'uppercase' }} 
          value={formData.gstNumber}
          onChange={handleGstChange}
        />
      </Form.Item>

      <Form.Item
        name="panCard"
        label="PAN Card"
        rules={[{ required: true, message: 'Please upload your PAN card!' }]}
        extra="Supported formats: JPG, PNG, PDF (Max size: 2MB)"
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Upload PAN Card</Button>
        </Upload>
      </Form.Item>

      <div className="flex justify-end gap-4">
        <Button onClick={onPrev}>Previous</Button>
        <Button type="primary" htmlType="submit">
          Submit & Continue
        </Button>
      </div>
    </Form>
  )
}

export default EKYCForm 