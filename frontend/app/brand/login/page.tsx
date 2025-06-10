'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface LoginForm {
  email: string
  password: string
}

const BrandLoginPage = () => {
  const [loading, setLoading] = useState(false)
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

      if (response.ok) {
        const data = await response.json()
        // Store the token and user info
        localStorage.setItem('brandToken', data.token)
        localStorage.setItem('brandUser', JSON.stringify(data.user))
        message.success('Login successful!')
        router.push('/brand/dashboard')
      } else {
        message.error('Invalid email or password')
      }
    } catch (error) {
      message.error('Error during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Brand Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Brand Portal Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your brand dashboard
          </p>
        </div>

        <Form
          name="brand_login"
          onFinish={onFinish}
          className="mt-8 space-y-6"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default BrandLoginPage 