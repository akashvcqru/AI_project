'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Steps } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined, LoginOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

interface SetupPasswordForm {
  email: string
  password: string
  confirmPassword: string
}

const BrandLoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await fetch('https://localhost:7001/api/Brand/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.isFirstLogin) {
          setIsFirstLogin(true)
          setCurrentStep(1)
          message.info('Please set up your password')
        } else {
          // Store the token and user info
          localStorage.setItem('brandToken', data.token)
          localStorage.setItem('brandUser', JSON.stringify(data.user))
          message.success('Login successful!')
          router.push('/brand/dashboard')
        }
      } else {
        message.error(data.message || 'Invalid email or password')
      }
    } catch (error) {
      message.error('Error during login')
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen flex justify-center items-center p-5 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <Card
        className="w-full max-w-[400px] shadow-2xl rounded-xl border-none"
        bordered={false}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-2xl">
            <UserOutlined />
          </div>
          <Title level={2} className="m-0 text-gray-800">
            Brand Login
          </Title>
          <Text type="secondary">
            {isFirstLogin ? 'Set up your password' : 'Sign in to access your brand dashboard'}
          </Text>
        </div>

        {!isFirstLogin ? (
          <Form
            name="brand_login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
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
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InfoCircleOutlined className="text-blue-500 mt-1 mr-2" />
                <Text className="text-sm text-gray-600">
                  New user? Enter your email and you'll be prompted to set up your password on first login.
                </Text>
              </div>
            </div>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                className="w-full h-12 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none text-base font-medium"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>

            <div className="flex justify-between items-center mb-6 text-sm">
              <Button 
                type="link" 
                onClick={() => router.push('/brand/forgot-password')}
                className="p-0 text-[#667eea] text-sm"
              >
                Forgot Password?
              </Button>
              <Button 
                type="link" 
                onClick={() => router.push('/onboarding')}
                className="p-0 text-[#667eea] text-sm"
              >
                New to VCQRU?
              </Button>
            </div>
          </Form>
        ) : (
          <Form
            name="setup_password"
            onFinish={onSetupPassword}
            autoComplete="off"
            size="large"
            initialValues={{ email: '' }}
          >
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InfoCircleOutlined className="text-blue-500 mt-1 mr-2" />
                <Text className="text-sm text-gray-600">
                  Welcome! Please set up your password to continue.
                </Text>
              </div>
            </div>

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
                { min: 8, message: 'Password must be at least 8 characters!' }
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
        )}

        {!isFirstLogin && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Text type="secondary" className="text-xs">
              Need help? Contact support at:
            </Text>
            <br />
            <Text code className="text-xs">
              support@vcqru.com
            </Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default BrandLoginPage 