'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useLoginMutation } from '@/app/store/services/adminApi'
import { useAuth } from '@/app/store/hooks/useAuth'

const { Title, Text } = Typography

const AdminLoginPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { login: authLogin, isAuthenticated } = useAuth()
  const router = useRouter()
  const [login] = useLoginMutation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, router])

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      console.log('Attempting login with:', { email: values.email.trim().toLowerCase() })
      
      const result = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password
      }).unwrap()
      
      console.log('Login response:', result)
      
      if (result.email && result.isSuperAdmin) {
        // Create user object for auth state
        const user = {
          email: result.email,
          isSuperAdmin: result.isSuperAdmin
        }
        
        // Generate token and update auth state
        const token = `admin-token-${Date.now()}`
        authLogin(user, token)
        
        message.success('Login successful!')
        router.push('/admin')
      } else {
        throw new Error('Invalid response format from server')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle error messages
      const errorMessage = error.data?.message || error.message || 'Login failed. Please try again.'
      message.error(errorMessage)
    } finally {
      setLoading(false)
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
            Admin Login
          </Title>
          <Text type="secondary">
            Sign in to access the admin dashboard
          </Text>
        </div>

        <Form
          form={form}
          name="admin-login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
          initialValues={{
            email: 'superadmin@vcqru.com',
            password: 'VCQRU@2024'
          }}
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

        <div style={{
          textAlign: 'center', 
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Super Admin Credentials:
          </Text>
          <br />
          <Text code style={{ fontSize: '12px' }}>
            Email: superadmin@vcqru.com
          </Text>
          <br />
          <Text code style={{ fontSize: '12px' }}>
            Password: VCQRU@2024
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default AdminLoginPage 