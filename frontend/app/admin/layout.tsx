'use client'

import { useState } from 'react'
import { Layout, Menu, theme, Avatar, Dropdown, Modal, Form, Input, message, MenuProps } from 'antd'
import { 
  DashboardOutlined, 
  TeamOutlined, 
  UserOutlined, 
  LogoutOutlined,
  LockOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import AdminBreadcrumb from './components/Breadcrumb'

const { Header, Sider, Content } = Layout

type MenuItem = Required<MenuProps>['items'][number]

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/admin/')
    },
    {
      key: 'companies',
      icon: <TeamOutlined />,
      label: 'Company List',
      onClick: () => router.push('/admin/companies')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  // Get the current selected key based on pathname
  const getSelectedKey = () => {
    // Check if we're on the dashboard (either /admin or /admin/dashboard)
    if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/dashboard') {
      return ['dashboard']
    }
    if (pathname === '/admin/companies') {
      return ['companies']
    }
    return [] // Return empty array if no match
  }

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
        setIsPasswordModalVisible(false)
        passwordForm.resetFields()
      } else {
        message.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      message.error('Failed to change password. Please try again.')
    }
  }

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          style={{ 
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
            zIndex: 50
          }}
          className="border-r border-gray-100"
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <h2 className={`text-blue-600 text-xl font-bold transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              {collapsed ? 'SA' : 'Super Admin'}
            </h2>
          </div>
          <Menu
            theme="light"
            selectedKeys={getSelectedKey()}
            mode="inline"
            items={menuItems}
            className="border-0"
          />
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
          <Header style={{ 
            padding: '0 24px', 
            background: colorBgContainer,
            position: 'fixed',
            top: 0,
            right: 0,
            width: `calc(100% - ${collapsed ? 80 : 200}px)`,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s'
          }}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Profile',
                    onClick: () => router.push('/admin/profile')
                  },
                  {
                    key: 'change-password',
                    icon: <LockOutlined />,
                    label: 'Change Password',
                    onClick: () => router.push('/admin/change-password')
                  },
                  {
                    type: 'divider'
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    onClick: handleLogout
                  }
                ]
              }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <div className="flex items-center cursor-pointer px-3 py-2 rounded hover:bg-gray-50 transition-colors duration-200">
                <Avatar 
                  style={{ 
                    backgroundColor: '#1890ff',
                    marginRight: '8px',
                    cursor: 'pointer'
                  }} 
                  icon={<UserOutlined />} 
                />
                <span className="text-gray-800 mr-1">Admin</span>
                <SettingOutlined className="text-gray-500" />
              </div>
            </Dropdown>
          </Header>

          <Content style={{ 
            margin: '88px 24px 24px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
            position: 'relative',
            paddingBottom: '80px'
          }}>
            {pathname !== '/admin/dashboard' && <AdminBreadcrumb />}
            {children}
            <div className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-white border-t border-gray-100 text-center text-gray-600 text-sm">
              <div>© Copyright {new Date().getFullYear()} VCQRU Private Limited | All Rights Reserved.</div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  )
} 