'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Typography, Row, Col, Upload, Avatar } from 'antd'
import { UserOutlined, UploadOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useAuth } from '@/app/store/hooks/useAuth'
import type { UploadProps } from 'antd'

const { Title } = Typography

interface CompanyProfile {
  companyName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber: string
  logo?: string
}

export default function BrandProfilePage() {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
  })

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setProfile({
        companyName: user?.companyName || '',
        email: user?.email || '',
        phone: '+91 9876543210',
        address: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gstNumber: '27ABCDE1234F1Z5',
      })
    }, 1000)
  }, [user])

  const handleProfileUpdate = async (values: CompanyProfile) => {
    try {
      setLoading(true)
      // Here you would typically make an API call to update the profile
      console.log('Updating profile:', values)
      message.success('Profile updated successfully!')
    } catch (error) {
      message.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'logo',
    action: '/api/upload', // Replace with your upload endpoint
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`)
        // Update profile with new logo URL
        setProfile(prev => ({
          ...prev,
          logo: info.file.response.url
        }))
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`)
      }
    },
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2}>Company Profile</Title>

      <Card className="mb-6">
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={profile.logo}
              className="mb-4"
            />
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Logo</Button>
            </Upload>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={profile}
          onFinish={handleProfileUpdate}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gstNumber"
                label="GST Number"
                rules={[{ required: true, message: 'Please enter GST number' }]}
              >
                <Input placeholder="Enter GST number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea
              prefix={<EnvironmentOutlined />}
              placeholder="Enter address"
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[{ required: true, message: 'Please enter pincode' }]}
              >
                <Input placeholder="Enter pincode" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] border-none text-base font-medium"
            >
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
} 