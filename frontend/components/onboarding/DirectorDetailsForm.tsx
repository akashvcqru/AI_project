import { Form, Input, Button, message, Upload, Spin } from 'antd'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useEffect, useState } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface DirectorDetailsFormProps {
  onNext: () => void
  onPrev: () => void
}

interface PANVerificationResponse {
  success: boolean
  result?: {
    pan_number: string
    pan_status: string
    user_full_name: string
    name_match_score: string
    pan_type: string
  }
}

const DirectorDetailsForm = ({ onNext, onPrev }: DirectorDetailsFormProps) => {
  const { formData, updateFormData, saveProgress } = useOnboarding()
  const [form] = Form.useForm()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isPanVerified, setIsPanVerified] = useState<boolean | null>(formData.panNumber && formData.isPanVerified ? true : null)

  // Pre-fill form with existing data
  useEffect(() => {
    form.setFieldsValue({
      name: formData.name,
      panNumber: formData.panNumber,
      aadharNumber: formData.aadharNumber,
      designation: formData.designation,
      directorAddress: formData.directorAddress || ''
    })
  }, [form, formData])

  const verifyPAN = async (panNumber: string, name: string) => {
    try {
      setIsVerifying(true)
      const response = await fetch('https://live.zoop.one/api/v1/in/identity/pan/lite', {
        method: 'POST',
        headers: {
          'app-id': '648d7d9a22658f001d0193ac',
          'api-key': 'W5Q2V99-JFC4D4D-QS0PG29-C6DNJYR',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'sync',
          data: {
            customer_pan_number: panNumber,
            pan_holder_name: name,
            consent: 'Y',
            consent_text: 'I hear by declare my consent agreement for fetching my information via ZOOP API'
          },
          task_id: crypto.randomUUID()
        })
      })

      const data: PANVerificationResponse = await response.json()
      
      if (data.success && data.result) {
        const { pan_status, user_full_name, name_match_score } = data.result
        
        if (pan_status === 'VALID' && parseFloat(name_match_score) >= 80) {
          setIsPanVerified(true)
          updateFormData('isPanVerified', true)
          updateFormData('name', user_full_name) // Update name with verified name
          form.setFieldsValue({ name: user_full_name })
          message.success('PAN verification successful')
        } else {
          setIsPanVerified(false)
          updateFormData('isPanVerified', false)
          message.error('PAN verification failed: Name mismatch or invalid PAN')
        }
      } else {
        setIsPanVerified(false)
        updateFormData('isPanVerified', false)
        message.error('Invalid PAN number')
      }
    } catch (error) {
      setIsPanVerified(false)
      updateFormData('isPanVerified', false)
      message.error('Failed to verify PAN')
    } finally {
      setIsVerifying(false)
    }
  }

  const handlePanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    updateFormData('panNumber', value)
    form.setFieldsValue({ panNumber: value })
    
    // Reset verification status when PAN number changes
    if (value !== formData.panNumber) {
      setIsPanVerified(null)
      updateFormData('isPanVerified', false)
    }
    
    // Verify PAN when both PAN number and name are entered
    const name = form.getFieldValue('name')
    if (value.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) && name) {
      await verifyPAN(value, name)
    }
  }

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateFormData('name', value)
    form.setFieldsValue({ name: value })
    
    // Reset verification status when name changes
    if (value !== formData.name) {
      setIsPanVerified(null)
      updateFormData('isPanVerified', false)
    }
    
    // Verify PAN when both PAN number and name are entered
    const panNumber = form.getFieldValue('panNumber')
    if (panNumber && panNumber.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) && value) {
      await verifyPAN(panNumber, value)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Update form data with current values
      const updates = {
        name: values.name,
        panNumber: values.panNumber,
        aadharNumber: values.aadharNumber,
        designation: values.designation,
        directorAddress: values.directorAddress,
        photo: values.photo,
        signature: values.signature
      }

      // Update each field individually
      Object.entries(updates).forEach(([key, value]) => {
        updateFormData(key as keyof typeof formData, value)
      })
      
      // Save progress
      saveProgress()
      
      message.success('Director details submitted successfully!')
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

  const photoUploadProps: UploadProps = {
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
        updateFormData('photo', info.file)
      } else if (info.file.status === 'removed') {
        updateFormData('photo', null)
      }
    },
    maxCount: 1,
    listType: 'text',
    defaultFileList: formData.photo ? [formData.photo] : []
  }

  const signatureUploadProps: UploadProps = {
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
        updateFormData('signature', info.file)
      } else if (info.file.status === 'removed') {
        updateFormData('signature', null)
      }
    },
    maxCount: 1,
    listType: 'text',
    defaultFileList: formData.signature ? [formData.signature] : []
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
        help={
          isPanVerified === true ? 
            <span style={{ color: '#52c41a' }}>PAN verified successfully</span> : 
            isPanVerified === false ? 
              <span style={{ color: '#ff4d4f' }}>PAN verification failed. Please check the details.</span> : 
              null
        }
      >
        <Input 
          placeholder="Enter PAN number" 
          style={{ textTransform: 'uppercase' }} 
          value={formData.panNumber}
          onChange={handlePanChange}
          disabled={isVerifying || isPanVerified === true}
          suffix={isVerifying ? <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} /> : null}
        />
      </Form.Item>

      <Form.Item
        name="name"
        label="Full Name"
        rules={[{ required: true, message: 'Please input director name!' }]}
      >
        <Input 
          placeholder="Enter full name" 
          value={formData.name}
          onChange={handleNameChange}
          disabled={isVerifying || isPanVerified === true}
        />
      </Form.Item>

      <Form.Item
        name="aadharNumber"
        label="Aadhar Number"
        rules={[
          { required: true, message: 'Please input your Aadhar number!' },
          { pattern: /^[0-9]{12}$/, message: 'Please enter a valid 12-digit Aadhar number' }
        ]}
      >
        <Input 
          placeholder="Enter your Aadhar number" 
          maxLength={12} 
          value={formData.aadharNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            updateFormData('aadharNumber', value)
            form.setFieldsValue({ aadharNumber: value })
          }}
        />
      </Form.Item>

      <Form.Item
        name="designation"
        label="Designation"
        rules={[{ required: true, message: 'Please input designation!' }]}
      >
        <Input 
          placeholder="Enter designation" 
          value={formData.designation}
          onChange={(e) => {
            updateFormData('designation', e.target.value)
            form.setFieldsValue({ designation: e.target.value })
          }}
        />
      </Form.Item>

      <Form.Item
        name="directorAddress"
        label="Residential Address"
        rules={[{ required: true, message: 'Please input residential address!' }]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Enter residential address" 
          value={formData.directorAddress || ''}
          onChange={(e) => {
            const value = e.target.value
            updateFormData('directorAddress', value)
            form.setFieldsValue({ directorAddress: value })
          }}
        />
      </Form.Item>

      <Form.Item
        name="photo"
        label="Photo"
        rules={[{ required: true, message: 'Please upload photo!' }]}
        extra="Supported formats: JPG, PNG (Max size: 2MB)"
      >
        <Upload {...photoUploadProps}>
          <Button icon={<UploadOutlined />}>Upload Photo</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="signature"
        label="Signature"
        rules={[{ required: true, message: 'Please upload signature!' }]}
        extra="Supported formats: JPG, PNG (Max size: 2MB)"
      >
        <Upload {...signatureUploadProps}>
          <Button icon={<UploadOutlined />}>Upload Signature</Button>
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

export default DirectorDetailsForm 