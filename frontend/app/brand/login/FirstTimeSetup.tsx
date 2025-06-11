'use client'

import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title, Text } = Typography

interface SetupPasswordForm {
  email: string
  password: string
  confirmPassword: string
}

interface FirstTimeSetupProps {
  email: string
  onSetupComplete: () => void
}

const FirstTimeSetup = ({ email, onSetupComplete }: FirstTimeSetupProps) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSetupPassword = async (values: SetupPasswordForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://localhost:7001/api/Brand/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store the token and user info
        localStorage.setItem('brandToken', data.token)
        localStorage.setItem('brandUser', JSON.stringify(data.user))
        message.success('Password set up successfully!')
        onSetupComplete()
        router.push('/brand/dashboard')
      } else {
        message.error(data.message || 'Error setting up password')
      }
    } catch (error) {
      message.error('Error during password setup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-2xl">
          <SafetyOutlined />
        </div>
        <Title level={2} className="m-0 text-gray-800">
          Set Up Your Password
        </Title>
        <Text type="secondary">
          Welcome to VCQRU! Please create a secure password to continue.
        </Text>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <InfoCircleOutlined className="text-blue-500 mt-1 mr-2" />
          <div>
            <Text className="text-sm text-gray-600 block mb-2">
              Your password must meet the following requirements:
            </Text>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li>At least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        </div>
      </div>

      <Form
        name="setup_password"
        onFinish={onSetupPassword}
        autoComplete="off"
        size="large"
        initialValues={{ email }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            className="rounded-lg"
            disabled
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Password must include uppercase, lowercase, number and special character!'
            }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match!'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SafetyOutlined />}
            className="w-full h-12 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none text-base font-medium"
          >
            {loading ? 'Setting Up...' : 'Set Password'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FirstTimeSetup 