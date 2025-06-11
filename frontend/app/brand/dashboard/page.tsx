'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Layout, Menu } from 'antd'
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
  companyName: string
  companyDetails: {
    name: string
    category: string
    websiteUrl: string
    country: string
    state: string
    city: string
    address: string
  }
  directorDetails: {
    aadharNumber: string
    panNumber: string
  }
  ekyc: {
    gstNumber: string
  }
}

const BrandDashboard = () => {
  const [user, setUser] = useState<BrandUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('brandUser')
    const token = localStorage.getItem('brandToken')

    if (!userStr || !token) {
      router.push('/brand/login')
      return
    }

    setUser(JSON.parse(userStr))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('brandToken')
    localStorage.removeItem('brandUser')
    router.push('/brand/login')
  }

  if (!user) {
    return null
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="flex items-center justify-between bg-white px-6">
        <div className="flex items-center">
          <Title level={4} className="m-0">Brand Portal</Title>
        </div>
        <div className="flex items-center">
          <span className="mr-4">Welcome, {user.companyDetails?.name}</span>
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
          <Title level={3}>Welcome to {user.companyDetails?.name}</Title>
          
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
                <p><strong>Company Name:</strong> {user.companyDetails?.name}</p>
                <p><strong>Category:</strong> {user.companyDetails?.category}</p>
                <p><strong>Website:</strong> {user.companyDetails?.websiteUrl}</p>
                <p><strong>Address:</strong> {user.companyDetails?.address}</p>
              </Col>
              <Col span={12}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>PAN Number:</strong> {user.directorDetails?.panNumber}</p>
                <p><strong>GST Number:</strong> {user.ekyc?.gstNumber}</p>
                <p><strong>Location:</strong> {user.companyDetails?.city}, {user.companyDetails?.state}, {user.companyDetails?.country}</p>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default BrandDashboard 