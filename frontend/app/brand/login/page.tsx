'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Typography, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import FirstTimeSetup from './FirstTimeSetup'

const { Title, Text } = Typography

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

const BrandLoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleEmailSubmit = async (values: { email: string }) => {
    setLoading(true)
    try {
      const verifyResponse = await fetch('http://localhost:5000/api/brand/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })

      const verifyData = await verifyResponse.json()
      console.log('Email verification response:', verifyData)

      if (!verifyResponse.ok) {
        if (verifyResponse.status === 404) {
          message.error('This email is not registered. Please enter a registered email address or contact support for assistance.')
        } else if (verifyResponse.status === 400) {
          // Handle different status cases
          console.log('Handling 400 response with verifiedStatus:', verifyData.verifiedStatus)
          switch (verifyData.verifiedStatus) {
            case 'Pending':
              message.warning(verifyData.message)
              break
            case 'Rejected':
              message.error(verifyData.message)
              break
            case 'NotSet':
            case 'Invalid':
              message.error(verifyData.message)
              break
            default:
              message.error(verifyData.message || 'An error occurred during verification')
          }
          return
        } else {
          message.error(verifyData.message || 'Email verification failed')
        }
        return
      }

      // For successful response (approved users)
      console.log('Handling successful response with verifiedStatus:', verifyData.verifiedStatus)
      if (verifyData.verifiedStatus === 'Approved') {
        console.log('User is approved, isFirstLogin:', verifyData.isFirstLogin)
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(verifyData.user))
        setEmail(values.email)

        // Handle first login vs returning user
        if (verifyData.isFirstLogin) {
          message.success(verifyData.message || 'Email verified. Please set up your password.')
          setShowPasswordSetup(true)
        } else {
          message.success(verifyData.message || 'Email verified. Please enter your password.')
          setShowPasswordInput(true)
        }
      } else {
        console.log('User is not approved, verifiedStatus:', verifyData.verifiedStatus)
        message.error('Your account is not approved. Please contact support for assistance.')
      }
    } catch (error) {
      console.error('Error during email verification:', error)
      message.error('An error occurred during email verification')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (values: { password: string }) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/brand/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store the token and user info with correct keys
        localStorage.setItem('brandToken', data.token)
        localStorage.setItem('brandUser', JSON.stringify(data.user))
        message.success('Login successful!')
        
        // Redirect to brand dashboard
        router.push('/brand/dashboard')
      } else {
        message.error(data.message || 'Invalid password')
      }
    } catch (error) {
      console.error('Error:', error)
      message.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleSetupComplete = () => {
    message.success('Password set up successfully!')
    router.push('/brand/dashboard')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const PasswordRequirementItem = ({ requirement, password }: { requirement: PasswordRequirement; password: string }) => {
    const isMet = requirement.validator(password)
    return (
      <div className="flex items-center gap-2 mb-2">
        {isMet ? (
          <CheckCircleOutlined className="text-green-500" />
        ) : (
          <CloseCircleOutlined className="text-red-500" />
        )}
        <Text style={{ color: isMet ? '#22c55e' : '#ef4444' }}>
          {requirement.text}
        </Text>
      </div>
    )
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
        {!showPasswordSetup && (
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
              {showPasswordInput ? 'Enter your password' : 'Sign in to access your brand dashboard'}
            </Text>
          </div>
        )}

        {showPasswordSetup ? (
          <FirstTimeSetup
            email={email}
            onSetupComplete={handleSetupComplete}
            onBack={() => {
              setShowPasswordSetup(false)
              setShowPasswordInput(false)
            }}
          />
        ) : showPasswordInput ? (
          <Form
            name="password_login"
            onFinish={handlePasswordSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
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
                className="w-full"
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
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                type="link"
                onClick={() => {
                  setShowPasswordInput(false)
                  setEmail('')
                }}
                className="w-full"
              >
                Back to Email
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
          </Form>
        ) : (
          <Form
            name="email_login"
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

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
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
                {loading ? 'Signing in...' : 'Login'}
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
          </Form>
        )}
      </Card>
    </div>
  )
}

export default BrandLoginPage 