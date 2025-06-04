import { Form, Input, Button, message, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useEffect } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface DirectorDetailsFormProps {
  onNext: () => void
  onPrev: () => void
}

const DirectorDetailsForm = ({ onNext, onPrev }: DirectorDetailsFormProps) => {
  const { formData, updateFormData, saveProgress } = useOnboarding()
  const [form] = Form.useForm()

  // Pre-fill form with existing data
  useEffect(() => {
    form.setFieldsValue({
      name: formData.name,
      aadharNumber: formData.aadharNumber,
      designation: formData.designation,
      address: formData.directorAddress
    })
  }, [form, formData])

  const handleFieldChange = (field: string, value: string) => {
    const mappedField = field === 'address' ? 'directorAddress' : field
    updateFormData(mappedField as keyof typeof formData, value)
    form.setFieldsValue({ [field]: value })
  }

  const handleSubmit = async (values: any) => {
    try {
      // Update all form data with proper field mapping
      updateFormData('name', values.name)
      updateFormData('aadharNumber', values.aadharNumber)
      updateFormData('designation', values.designation)
      updateFormData('directorAddress', values.address)
      
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
        name="name"
        label="Full Name"
        rules={[{ required: true, message: 'Please input director name!' }]}
      >
        <Input 
          placeholder="Enter full name" 
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
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
          onChange={(e) => handleFieldChange('aadharNumber', e.target.value.replace(/\D/g, ''))}
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
          onChange={(e) => handleFieldChange('designation', e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="address"
        label="Residential Address"
        rules={[{ required: true, message: 'Please input residential address!' }]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Enter residential address" 
          value={formData.directorAddress}
          onChange={(e) => handleFieldChange('address', e.target.value)}
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