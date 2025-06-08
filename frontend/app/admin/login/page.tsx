'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, message, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '@/app/store/hooks/useAuth'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'

const { Title, Text } = Typography

const AdminLoginPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, router])

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const success = await login(values.email, values.password)
      
      if (success) {
        message.success('Login successful!')
        router.push('/admin')
      } else {
        message.error('Invalid email or password')
      }
    } catch (error) {
      message.error('Login failed. Please try again.')
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
            Super Admin
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
            Demo Credentials:
          </Text>
          <br />
          <Text code style={{ fontSize: '12px' }}>
            Email: admin@admin.com
          </Text>
          <br />
          <Text code style={{ fontSize: '12px' }}>
            Password: admin123
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default AdminLoginPage 