'use client'

import { LockOutlined, SafetyOutlined, KeyOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ChangePasswordPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (values: any) => {
    try {
      setLoading(true)
      if (values.newPassword !== values.confirmPassword) {
        message.error('New passwords do not match!')
        return
      }

      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        message.success('Password changed successfully!')
        form.resetFields()
        router.push('/admin/dashboard')
      } else {
        message.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      message.error('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
          <p className="text-gray-600">Update your account password to keep it secure</p>
        </div>

        <Card className="shadow-lg rounded-xl border-0">
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePasswordChange}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Form.Item
                name="currentPassword"
                label={
                  <span className="text-gray-700 font-medium">
                    <LockOutlined className="mr-2" />
                    Current Password
                  </span>
                }
                rules={[
                  { required: true, message: 'Please input your current password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password 
                  size="large"
                  className="rounded-lg hover:border-blue-400 focus:border-blue-400"
                  placeholder="Enter your current password"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label={
                  <span className="text-gray-700 font-medium">
                    <KeyOutlined className="mr-2" />
                    New Password
                  </span>
                }
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
                  }
                ]}
                help={
                  <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                    <li>At least 6 characters long</li>
                    <li>Contains at least one uppercase letter</li>
                    <li>Contains at least one lowercase letter</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character</li>
                  </ul>
                }
              >
                <Input.Password 
                  size="large"
                  className="rounded-lg hover:border-blue-400 focus:border-blue-400"
                  placeholder="Enter your new password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={
                  <span className="text-gray-700 font-medium">
                    <SafetyOutlined className="mr-2" />
                    Confirm New Password
                  </span>
                }
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('The two passwords do not match!'))
                    },
                  }),
                ]}
              >
                <Input.Password 
                  size="large"
                  className="rounded-lg hover:border-blue-400 focus:border-blue-400"
                  placeholder="Confirm your new password"
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="default"
                size="large"
                onClick={() => router.push('/admin/dashboard')}
                className="rounded-lg hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                Update Password
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
} 