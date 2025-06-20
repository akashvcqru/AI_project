import { Form, Input, Button, message } from 'antd'
import { useEffect } from 'react'
import { useOnboarding } from '../../contexts/OnboardingContext'

interface CompanyDetailsFormProps {
  onNext: () => void
  onPrev: () => void
}

const CompanyDetailsForm = ({ onNext, onPrev }: CompanyDetailsFormProps) => {
  const { formData, updateFormData, saveProgress } = useOnboarding()
  const [form] = Form.useForm()

  // Pre-fill form with existing data
  useEffect(() => {
    form.setFieldsValue({
      companyName: formData.companyName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    })
  }, [form, formData])

  const handleFieldChange = (field: string, value: string) => {
    updateFormData(field as keyof typeof formData, value)
    form.setFieldsValue({ [field]: value })
  }

  const handleSubmit = async (values: any) => {
    try {
      // Update all form data
      Object.keys(values).forEach(key => {
        updateFormData(key as keyof typeof formData, values[key])
      })
      
      // Save progress
      saveProgress()
      
      message.success('Company details submitted successfully!')
      onNext()
    } catch (error) {
      message.error('Submission failed. Please try again.')
    }
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="companyName"
        label="Company Name"
        rules={[{ required: true, message: 'Please input your company name!' }]}
      >
        <Input 
          placeholder="Enter company name" 
          value={formData.companyName}
          onChange={(e) => handleFieldChange('companyName', e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="address"
        label="Company Address"
        rules={[{ required: true, message: 'Please input your company address!' }]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Enter company address" 
          value={formData.address}
          onChange={(e) => handleFieldChange('address', e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="city"
        label="City"
        rules={[{ required: true, message: 'Please input your city!' }]}
      >
        <Input 
          placeholder="Enter city" 
          value={formData.city}
          onChange={(e) => handleFieldChange('city', e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="state"
        label="State"
        rules={[{ required: true, message: 'Please input your state!' }]}
      >
        <Input 
          placeholder="Enter state" 
          value={formData.state}
          onChange={(e) => handleFieldChange('state', e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="pincode"
        label="Pincode"
        rules={[
          { required: true, message: 'Please input your pincode!' },
          { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit pincode' }
        ]}
      >
        <Input 
          placeholder="Enter pincode" 
          value={formData.pincode}
          onChange={(e) => handleFieldChange('pincode', e.target.value.replace(/\D/g, ''))}
          maxLength={6}
        />
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

export default CompanyDetailsForm 