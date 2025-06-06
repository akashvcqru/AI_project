import { Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useState, useEffect } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface EKYCFormProps {
  onNext: () => void
  onPrev: () => void
}

const EKYCForm = ({ onNext, onPrev }: EKYCFormProps) => {
  const { formData, updateFormData, saveProgress } = useOnboarding()
  const [form] = Form.useForm()

  // Pre-fill form with existing data
  useEffect(() => {
    form.setFieldsValue({
      gstNumber: formData.gstNumber
    })
  }, [form, formData.gstNumber])

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    updateFormData('gstNumber', value)
    form.setFieldsValue({ gstNumber: value })
  }

  const handleSubmit = async (values: any) => {
    try {
      // Update form data with current values
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
    const { file, onSuccess, onError } = options

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
        updateFormData('gstDocument', info.file)
      } else if (info.file.status === 'removed') {
        updateFormData('gstDocument', null)
      }
    },
    maxCount: 1,
    listType: 'text',
    defaultFileList: formData.gstDocument ? [formData.gstDocument] : []
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
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
        name="gstDocument"
        label="GST Registration Certificate"
        rules={[{ required: true, message: 'Please upload your GST registration certificate!' }]}
        extra="Supported formats: JPG, PNG, PDF (Max size: 2MB)"
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Upload GST Certificate</Button>
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