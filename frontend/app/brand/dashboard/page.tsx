'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Layout, Menu, Alert } from 'antd'
import { 
  ShopOutlined, 
  UserOutlined, 
  FileOutlined, 
  LogoutOutlined 
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Header, Sider, Content } = Layout
const { Title } = Typography

interface BrandUser {
  id: number
  email: string
  companyName: string | null
  companyDetails: {
    name: string | null
    category: string | null
    websiteUrl: string | null
    country: string | null
    state: string | null
    city: string | null
    address: string | null
  }
  directorDetails: {
    aadharNumber: string | null
    panNumber: string | null
  }
  ekyc: {
    gstNumber: string | null
  }
}

const BrandDashboard = () => {
  const [user, setUser] = useState<BrandUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('brandUser')
      const token = localStorage.getItem('brandToken')

      console.log('Debug - User data from localStorage:', userStr)
      console.log('Debug - Token from localStorage:', token)

      if (!userStr || !token) {
        console.log('Debug - No user data or token found, redirecting to login')
        router.push('/brand/login')
        return
      }

      const userData = JSON.parse(userStr)
      console.log('Debug - Parsed user data:', userData)
      setUser(userData)
    } catch (err) {
      console.error('Debug - Error loading user data:', err)
      setError('Failed to load user data. Please try logging in again.')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('brandToken')
    localStorage.removeItem('brandUser')
    router.push('/brand/login')
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content className="p-6">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <button 
                onClick={() => router.push('/brand/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Login
              </button>
            }
          />
        </Content>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content className="p-6">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="flex items-center justify-between bg-white px-6">
        <div className="flex items-center">
          <Title level={4} className="m-0">Brand Portal</Title>
        </div>
        <div className="flex items-center">
          <span className="mr-4">Welcome, {user.email}</span>
          <LogoutOutlined 
            className="text-xl cursor-pointer" 
            onClick={handleLogout}
          />
        </div>
      </Header>

      <Layout>
        <Sider width={200} className="bg-white">
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="dashboard" icon={<ShopOutlined />}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="profile" icon={<UserOutlined />}>
              Profile
            </Menu.Item>
            <Menu.Item key="documents" icon={<FileOutlined />}>
              Documents
            </Menu.Item>
          </Menu>
        </Sider>

        <Content className="p-6">
          <Title level={3}>Welcome to Brand Portal</Title>
          
          <Row gutter={16} className="mt-6">
            <Col span={8}>
              <Card>
                <Statistic
                  title="Company Status"
                  value="Active"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Documents"
                  value={3}
                  suffix="/ 3"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Last Login"
                  value={new Date().toLocaleDateString()}
                />
              </Card>
            </Col>
          </Row>

          <Card className="mt-6">
            <Title level={4}>Company Information</Title>
            <Row gutter={[16, 16]} className="mt-4">
              <Col span={12}>
                <p><strong>Company Name:</strong> {user.companyDetails?.name || 'Not provided'}</p>
                <p><strong>Category:</strong> {user.companyDetails?.category || 'Not provided'}</p>
                <p><strong>Website:</strong> {user.companyDetails?.websiteUrl || 'Not provided'}</p>
                <p><strong>Address:</strong> {user.companyDetails?.address || 'Not provided'}</p>
              </Col>
              <Col span={12}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>PAN Number:</strong> {user.directorDetails?.panNumber || 'Not provided'}</p>
                <p><strong>GST Number:</strong> {user.ekyc?.gstNumber || 'Not provided'}</p>
                <p><strong>Location:</strong> {
                  [user.companyDetails?.city, user.companyDetails?.state, user.companyDetails?.country]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'
                }</p>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default BrandDashboard 