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

      const response = await fetch('/api/brand/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('brandToken')}`
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
        router.push('/brand')
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
            <LockOutlined />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <p className="text-gray-600">Update your password to keep your account secure</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
          requiredMark={false}
        >
          <div className="space-y-4">
            <Form.Item
              name="currentPassword"
              label={
                <span className="text-gray-700 font-medium">
                  <KeyOutlined className="mr-2" />
                  Current Password
                </span>
              }
              rules={[{ required: true, message: 'Please enter your current password!' }]}
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
                  <LockOutlined className="mr-2" />
                  New Password
                </span>
              }
              rules={[
                { required: true, message: 'Please enter your new password!' },
                { min: 8, message: 'Password must be at least 8 characters!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
                }
              ]}
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
              onClick={() => router.push('/brand')}
              className="rounded-lg hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] border-none"
            >
              Update Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
} 