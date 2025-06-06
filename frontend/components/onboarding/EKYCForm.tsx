import { Form, Input, Button, Upload, message, Spin } from 'antd'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useState, useEffect } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface EKYCFormProps {
  onNext: () => void
  onPrev: () => void
}

interface GSTVerificationResponse {
  success: boolean
  result?: {
    trade_name: string
    legal_name: string
    business_constitution: string
    current_registration_status: string
  }
}

const EKYCForm = ({ onNext, onPrev }: EKYCFormProps) => {
  const { formData, updateFormData, saveProgress } = useOnboarding()
  const [form] = Form.useForm()
  const [tradeName, setTradeName] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Pre-fill form with existing data
  useEffect(() => {
    form.setFieldsValue({
      gstNumber: formData.gstNumber
    })
  }, [form, formData.gstNumber])

  const verifyGST = async (gstNumber: string) => {
    try {
      setIsVerifying(true)
      const response = await fetch('https://live.zoop.one/api/v1/in/merchant/gstin/lite', {
        method: 'POST',
        headers: {
          'app-id': '648d7d9a22658f001d0193ac',
          'api-key': 'W5Q2V99-JFC4D4D-QS0PG29-C6DNJYR',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'sync',
          data: {
            business_gstin_number: gstNumber,
            consent: 'Y',
            consent_text: 'I hear by declare my consent agreement for fetching my information via ZOOP API'
          },
          task_id: crypto.randomUUID()
        })
      })

      const data: GSTVerificationResponse = await response.json()
      
      if (data.success && data.result) {
        setTradeName(data.result.trade_name)
        // Update company name in form data if it's empty
        if (!formData.companyName) {
          updateFormData('companyName', data.result.trade_name)
        }
        message.success('GST verification successful')
      } else {
        setTradeName('')
        message.error('Invalid GST number')
      }
    } catch (error) {
      setTradeName('')
      message.error('Failed to verify GST number')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleGstChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    updateFormData('gstNumber', value)
    form.setFieldsValue({ gstNumber: value })
    
    // Verify GST when a valid GST number is entered
    if (value.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
      await verifyGST(value)
    } else {
      setTradeName('')
    }
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
        help={tradeName ? <span style={{ color: '#52c41a' }}>Trade Name: {tradeName}</span> : null}
      >
        <Input 
          placeholder="Enter your GST number" 
          style={{ textTransform: 'uppercase' }} 
          value={formData.gstNumber}
          onChange={handleGstChange}
          disabled={isVerifying}
          suffix={isVerifying ? <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} /> : null}
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