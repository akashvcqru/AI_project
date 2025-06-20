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
    <div className="min-h-screen bg-gradient-to-r from-[#667eea] to-[#764ba2] flex justify-center items-center p-5">
      <Card
        className="w-full max-w-[400px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] rounded-xl"
        bordered={false}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
            <UserOutlined />
          </div>
          <Title level={2} className="m-0 text-gray-800">
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

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] border-none text-base font-medium"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
          <Text type="secondary" className="text-xs">
            Super Admin Credentials:
          </Text>
          <br />
          <Text code className="text-xs">
            Email: superadmin@vcqru.com
          </Text>
          <br />
          <Text code className="text-xs">
            Password: VCQRU@2024
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default AdminLoginPage 