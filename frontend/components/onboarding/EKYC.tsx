'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useVerifyPanMutation } from '@/store/services/onboardingApi'

interface EKYCProps {
  onNext: () => void
  onPrev: () => void
}

const EKYC = ({ onNext, onPrev }: EKYCProps) => {
  const [form] = Form.useForm()
  const [verifyPan] = useVerifyPanMutation()
  const [isPanVerified, setIsPanVerified] = useState(false)
  const [panNumber, setPanNumber] = useState('')

  const handlePanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setPanNumber(value)
    form.setFieldsValue({ panNumber: value })

    // Auto-verify PAN when 10 characters are entered
    if (value.length === 10) {
      try {
        const response = await verifyPan({
          panNumber: value,
          name: "",
          dateOfBirth: ""
        }).unwrap()
        
        if (response.success) {
          form.setFieldsValue({ name: response.panHolderName })
          setIsPanVerified(true)
          message.success('PAN verified successfully')
        } else {
          message.error('Invalid PAN number')
        }
      } catch (error) {
        message.error('Failed to verify PAN')
      }
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (!isPanVerified) {
        message.error('Please enter a valid PAN number')
        return
      }
      
      // Here you can handle GST verification if needed
      message.success('EKYC completed successfully!')
      onNext()
    } catch (error) {
      message.error('Verification failed. Please try again.')
    }
  }

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className="max-w-md mx-auto"
    >
      <Form.Item
        name="panNumber"
        label="PAN Number"
        rules={[
          { required: true, message: 'Please input your PAN number!' },
          { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Please enter a valid PAN number' }
        ]}
      >
        <Input
          placeholder="Enter PAN number"
          maxLength={10}
          disabled={isPanVerified}
          onChange={handlePanChange}
          style={{ textTransform: 'uppercase' }}
        />
      </Form.Item>

      <Form.Item
        name="name"
        label="Name (Auto-filled from PAN)"
        rules={[
          { required: true, message: 'Name is required!' }
        ]}
      >
        <Input
          placeholder="Name will be auto-filled"
          disabled={true}
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
          placeholder="Enter GST number"
          style={{ textTransform: 'uppercase' }}
        />
      </Form.Item>

      <div className="flex justify-end gap-4">
        <Button onClick={onPrev}>Previous</Button>
        <Button type="primary" htmlType="submit">
          Continue
        </Button>
      </div>
    </Form>
  )
}

export default EKYC 