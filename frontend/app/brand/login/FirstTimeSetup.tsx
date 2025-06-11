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
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'white',
          fontSize: '24px'
        }}>
          <SafetyOutlined />
        </div>
        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
          Set Up Your Password
        </Title>
        <Text type="secondary">
          Welcome to VCQRU! Please create a secure password to continue.
        </Text>
      </div>

      <div style={{
        marginBottom: '24px',
        padding: '16px',
        background: '#ebf5ff',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginTop: '4px', marginRight: '8px' }} />
          <div>
            <Text style={{ fontSize: '14px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
              Your password must meet the following requirements:
            </Text>
            <ul style={{ fontSize: '14px', color: '#4b5563', paddingLeft: '20px', margin: 0 }}>
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
            style={{ borderRadius: '8px' }}
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
          help="Password must be at least 8 characters and include uppercase, lowercase, number and special character"
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
            style={{ borderRadius: '8px' }}
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
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SafetyOutlined />}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Setting Up...' : 'Set Password'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FirstTimeSetup 