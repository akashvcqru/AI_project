'use client'

import { useState } from 'react'
import { Layout, Menu, theme, Avatar, Dropdown, Modal, Form, Input, message } from 'antd'
import { 
  DashboardOutlined, 
  TeamOutlined, 
  UserOutlined, 
  LogoutOutlined,
  LockOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

const { Header, Sider, Content } = Layout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false)
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const router = useRouter()
  const pathname = usePathname()
  const { adminUser, logout, isAuthenticated } = useAuth()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // If we're on the login page, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/companies',
      icon: <TeamOutlined />,
      label: 'Company List',
    },
  ]

  const handleProfileUpdate = async (values: any) => {
    try {
      // Here you would typically make an API call to update the profile
      message.success('Profile updated successfully!')
      setIsProfileModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Failed to update profile')
    }
  }

  const handlePasswordChange = async (values: any) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        message.error('New passwords do not match!')
        return
      }
      // Here you would typically make an API call to change the password
      message.success('Password changed successfully!')
      setIsPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch (error) {
      message.error('Failed to change password')
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => setIsProfileModalVisible(true),
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => setIsPasswordModalVisible(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout()
        router.push('/admin/login')
      },
    },
  ]

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          style={{
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
            zIndex: 10,
          }}
        >
          <div style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#1890ff',
              fontSize: collapsed ? '16px' : '20px',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}>
              {collapsed ? 'SA' : 'Super Admin'}
            </h2>
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>
        <Layout>
          <Header style={{ 
            padding: '0 24px', 
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            zIndex: 9,
          }}>
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight" 
              arrow
              trigger={['click']}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '0 12px',
                borderRadius: '4px',
                transition: 'background-color 0.3s',
                ':hover': {
                  backgroundColor: 'rgba(0,0,0,0.025)'
                }
              }}>
                <Avatar 
                  style={{ 
                    backgroundColor: '#1890ff',
                    marginRight: '8px',
                    cursor: 'pointer'
                  }} 
                  icon={<UserOutlined />} 
                />
                <span style={{ 
                  color: '#1f2937',
                  marginRight: '4px'
                }}>
                  {adminUser?.name}
                </span>
                <SettingOutlined style={{ color: '#666' }} />
              </div>
            </Dropdown>
          </Header>
          <Content style={{ 
            margin: '24px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto'
          }}>
            {children}
          </Content>
        </Layout>

        {/* Profile Modal */}
        <Modal
          title="Update Profile"
          open={isProfileModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsProfileModalVisible(false)
            form.resetFields()
          }}
          okText="Update"
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={{
              name: adminUser?.name,
              email: adminUser?.email,
            }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" disabled />
            </Form.Item>
          </Form>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          title="Change Password"
          open={isPasswordModalVisible}
          onOk={() => passwordForm.submit()}
          onCancel={() => {
            setIsPasswordModalVisible(false)
            passwordForm.resetFields()
          }}
          okText="Change"
          cancelText="Cancel"
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
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
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ProtectedRoute>
  )
} 