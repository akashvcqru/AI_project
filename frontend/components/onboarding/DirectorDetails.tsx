'use client'

import { Form, Input, Button, message } from 'antd'

interface DirectorDetailsProps {
  onNext: () => void
  onPrev: () => void
}

const DirectorDetails = ({ onNext, onPrev }: DirectorDetailsProps) => {
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    try {
      message.success('Director details saved successfully!')
      onNext()
    } catch (error) {
      message.error('Failed to save director details')
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
        name="directorName"
        label="Director Name"
        rules={[
          { required: true, message: 'Please input director name!' }
        ]}
      >
        <Input placeholder="Enter director name" />
      </Form.Item>

      <Form.Item
        name="mobileNumber"
        label="Mobile Number"
        rules={[
          { required: true, message: 'Please input mobile number!' },
          { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number' }
        ]}
      >
        <Input
          placeholder="Enter mobile number"
          maxLength={10}
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

export default DirectorDetails 