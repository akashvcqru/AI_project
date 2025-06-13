'use client'

import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined } from '@ant-design/icons'
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
  onBack: () => void
}

interface PasswordRequirement {
  text: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    text: 'At least 8 characters long',
    validator: (password) => password.length >= 8
  },
  {
    text: 'Include at least one uppercase letter',
    validator: (password) => /[A-Z]/.test(password)
  },
  {
    text: 'Include at least one number',
    validator: (password) => /[0-9]/.test(password)
  },
  {
    text: 'Include at least one special character',
    validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
]

const FirstTimeSetup = ({ email, onSetupComplete, onBack }: FirstTimeSetupProps) => {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  const onSetupPassword = async (values: SetupPasswordForm) => {
    setLoading(true)
    try {
      console.log('Sending setup password request:', {
        email: values.email,
        password: values.password,
      })

      const response = await fetch('http://localhost:5000/api/brand/setup-password', {
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
      console.log('Setup password response:', {
        status: response.status,
        data,
      })

      if (response.ok) {
        localStorage.setItem('brandToken', data.token)
        localStorage.setItem('brandUser', JSON.stringify(data.user))
        message.success('Password set up successfully!')
        onSetupComplete()
      } else {
        if (response.status === 400) {
          if (data.verifiedStatus === 'Pending') {
            message.warning('Your account is pending approval. Please wait for admin approval before setting up your password.')
          } else if (data.verifiedStatus === 'Rejected') {
            message.error('Your account has been rejected. Please contact support for assistance.')
          } else if (data.verifiedStatus === 'NotSet') {
            message.error('Your account status is not set. Please contact support for assistance.')
          } else {
            message.error(data.message || 'Error setting up password')
          }
        } else {
          message.error(data.message || 'Error setting up password')
        }
      }
    } catch (error) {
      console.error('Error during password setup:', error)
      message.error('Error during password setup')
    } finally {
      setLoading(false)
    }
  }

  const PasswordRequirementItem = ({ requirement, password }: { requirement: PasswordRequirement; password: string }) => {
    const isMet = requirement.validator(password)
    return (
      <div className="flex items-center gap-2 mb-2">
        {isMet ? (
          <CheckCircleOutlined className="text-green-500 text-lg" />
        ) : (
          <CloseCircleOutlined className="text-red-500 text-lg" />
        )}
        <Text style={{ color: isMet ? '#22c55e' : '#ef4444' }}>
          {requirement.text}
        </Text>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
          <SafetyOutlined />
        </div>
        <Title level={2} className="m-0 text-gray-800">
          Set Up Your Password
        </Title>
        <Text type="secondary">
          Welcome to VCQRU! Please create a secure password to continue.
        </Text>
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
            { min: 8, message: '' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: ''
            }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
            className="rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        <div className="mb-6">
          <Text strong className="block mb-2">Password Requirements:</Text>
          {passwordRequirements.map((requirement, index) => (
            <PasswordRequirementItem
              key={index}
              requirement={requirement}
              password={password}
            />
          ))}
        </div>

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
            className="w-full h-12 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] border-none text-base font-medium"
            loading={loading}
            icon={<LoginOutlined />}
          >
            {loading ? 'Setting up...' : 'Set Password'}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="link"
            onClick={onBack}
            className="w-full"
          >
            Back to Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FirstTimeSetup 