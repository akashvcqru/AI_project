'use client'

import { useEffect, useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, theme, message } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/app/store/hooks/useAuth'
import AdminBreadcrumb from './components/Breadcrumb'

const { Header, Sider, Content } = Layout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false)
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/admin'),
    },
    {
      key: '/admin/companies',
      icon: <TeamOutlined />,
      label: 'Companies',
      onClick: () => router.push('/admin/companies'),
    },
    {
      key: '/admin/profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/admin/profile'),
    },
  ]

  const handleProfileUpdate = async (values: any) => {
    try {
      // Here you would typically make an API call to update the profile
      message.success('Profile updated successfully!')
      setIsProfileModalVisible(false)
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
      } else {
        message.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      message.error('Failed to change password. Please try again.')
    }
  }

  if (!mounted) {
    return null
  }

  // If we're on the login page, render children directly without layout
  if (pathname === '/admin/login') {
    return <>{children}</>
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
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column'
          }}
          className="border-r border-gray-100"
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <h2 className={`text-blue-600 text-xl font-bold transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              {collapsed ? 'SA' : 'Super Admin'}
            </h2>
          </div>

          <div className="flex-1 overflow-auto">
            <Menu
              theme="light"
              selectedKeys={[pathname]}
              mode="inline"
              items={menuItems}
              className="border-0"
            />
          </div>

          <div className="border-t border-gray-100">
            <Menu
              theme="light"
              mode="inline"
              items={[
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  onClick: handleLogout
                }
              ]}
              className="border-0"
            />
          </div>

          <div className="p-4 border-t border-gray-100">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center"
            />
          </div>
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
              <div className="flex items-center cursor-pointer px-3 py-2">
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