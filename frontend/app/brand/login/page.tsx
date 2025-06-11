'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import FirstTimeSetup from './FirstTimeSetup'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password?: string
}

const BrandLoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleEmailSubmit = async (values: { email: string }) => {
    if (!values.email) {
      message.error('Please enter your email')
      return
    }

    try {
      const verifyResponse = await fetch('http://localhost:5000/api/brand/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        if (verifyResponse.status === 404) {
          message.error('This email is not registered. Please enter a registered email address or contact support for assistance.')
        } else if (verifyResponse.status === 400) {
          message.warning(verifyData.message || 'Your account is pending approval')
        } else {
          message.error(verifyData.message || 'Email verification failed')
        }
        return
      }

      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(verifyData.user))
      setEmail(values.email)

      if (verifyData.isFirstTimeLogin) {
        setShowPasswordSetup(true)
      } else {
        setShowPasswordInput(true)
      }
    } catch (error) {
      console.error('Error:', error)
      message.error('An error occurred during email verification')
    }
  }

  const handlePasswordSubmit = async (values: { password: string }) => {
    if (!values.password) {
      message.error('Please enter your password')
      return
    }

    try {
      const loginResponse = await fetch('http://localhost:5000/api/brand/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: values.password }),
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        message.error(loginData.message || 'Login failed')
        return
      }

      // Store token and user data
      localStorage.setItem('token', loginData.token)
      localStorage.setItem('userData', JSON.stringify(loginData.user))

      // Redirect to dashboard
      router.push('/brand/dashboard')
    } catch (error) {
      console.error('Error:', error)
      message.error('An error occurred during login')
    }
  }

  const handlePasswordSetup = async (values: { password: string; confirmPassword: string }) => {
    if (!values.password || !values.confirmPassword) {
      message.error('Please enter and confirm your password')
      return
    }

    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match')
      return
    }

    try {
      const setupResponse = await fetch('http://localhost:5000/api/brand/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: values.password }),
      })

      const setupData = await setupResponse.json()

      if (!setupResponse.ok) {
        if (setupResponse.status === 400) {
          message.warning(setupData.message || 'Your account is pending approval')
        } else {
          message.error(setupData.message || 'Password setup failed')
        }
        return
      }

      // Store token and user data
      localStorage.setItem('token', setupData.token)
      localStorage.setItem('userData', JSON.stringify(setupData.user))

      // Redirect to dashboard
      router.push('/brand/dashboard')
    } catch (error) {
      console.error('Error:', error)
      message.error('An error occurred during password setup')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          borderRadius: '12px'
        }}
        bordered={false}
      >
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
            <UserOutlined />
          </div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            Brand Login
          </Title>
          <Text type="secondary">
            {showPasswordSetup ? 'Set up your password' : 'Sign in to access your brand dashboard'}
          </Text>
        </div>

        {!showPasswordSetup && !showPasswordInput ? (
          <Form
            name="brand_login"
            onFinish={handleEmailSubmit}
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
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#ebf5ff',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <InfoCircleOutlined style={{ color: '#1890ff', marginTop: '4px', marginRight: '8px' }} />
                <Text style={{ fontSize: '14px', color: '#4b5563' }}>
                  Enter your email to continue. If this is your first time, you'll be prompted to set up your password.
                </Text>
              </div>
            </div>

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              <Button 
                type="link" 
                onClick={() => router.push('/brand/forgot-password')}
                style={{ padding: 0, color: '#667eea', fontSize: '14px' }}
              >
                Forgot Password?
              </Button>
              <Button 
                type="link" 
                onClick={() => router.push('/onboarding')}
                style={{ padding: 0, color: '#667eea', fontSize: '14px' }}
              >
                New to VCQRU?
              </Button>
            </div>
          </Form>
        ) : showPasswordSetup ? (
          <FirstTimeSetup 
            email={email} 
            onSetupComplete={() => setShowPasswordSetup(false)} 
          />
        ) : (
          <Form
            name="brand_password"
            onFinish={handlePasswordSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>
        )}

        {!showPasswordSetup && !showPasswordInput && (
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Need help? Contact support at:
            </Text>
            <br />
            <Text code style={{ fontSize: '12px' }}>
              support@vcqru.com
            </Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default BrandLoginPage 