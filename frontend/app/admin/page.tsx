'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Input, message, Card, Statistic, Tag, Space, Popconfirm, Layout, Avatar, Dropdown } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'

const { Header, Content } = Layout

interface OnboardingEntry {
  id: number
  email: string
  companyName: string
  directorName: string
  panNumber: string
  gstNumber: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalEntries: number
  pendingEntries: number
  approvedEntries: number
  rejectedEntries: number
}

const SuperAdminPage = () => {
  const [entries, setEntries] = useState<OnboardingEntry[]>([])
  const [stats, setStats] = useState<Stats>({ totalEntries: 0, pendingEntries: 0, approvedEntries: 0, rejectedEntries: 0 })
  const [loading, setLoading] = useState(false)
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const { adminUser, logout } = useAuth()

  useEffect(() => {
    fetchEntries()
    fetchStats()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://localhost:7001/api/Admin/onboarding-entries')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      } else {
        message.error('Failed to fetch onboarding entries')
      }
    } catch (error) {
      message.error('Error fetching entries')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('https://localhost:7001/api/Admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`https://localhost:7001/api/Admin/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        message.success('Entry approved successfully!')
        fetchEntries()
        fetchStats()
      } else {
        message.error('Failed to approve entry')
      }
    } catch (error) {
      message.error('Error approving entry')
    }
  }

  const handleReject = async () => {
    if (!selectedEntryId || !rejectionReason.trim()) {
      message.error('Please provide a rejection reason')
      return
    }

    try {
      const response = await fetch(`https://localhost:7001/api/Admin/reject/${selectedEntryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (response.ok) {
        message.success('Entry rejected successfully!')
        setRejectionModalVisible(false)
        setRejectionReason('')
        setSelectedEntryId(null)
        fetchEntries()
        fetchStats()
      } else {
        message.error('Failed to reject entry')
      }
    } catch (error) {
      message.error('Error rejecting entry')
    }
  }

  const openRejectModal = (id: number) => {
    setSelectedEntryId(id)
    setRejectionModalVisible(true)
  }

  const handleLogout = () => {
    logout()
    message.success('Logged out successfully')
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Tag color="orange" icon={<ExclamationCircleOutlined />}>Pending</Tag>
      case 'Approved':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Approved</Tag>
      case 'Rejected':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Rejected</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: adminUser?.email,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  const columns: ColumnsType<OnboardingEntry> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 180,
    },
    {
      title: 'Director Name',
      dataIndex: 'directorName',
      key: 'directorName',
      width: 150,
    },
    {
      title: 'PAN Number',
      dataIndex: 'panNumber',
      key: 'panNumber',
      width: 120,
    },
    {
      title: 'GST Number',
      dataIndex: 'gstNumber',
      key: 'gstNumber',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === 'Pending' && (
            <>
              <Popconfirm
                title="Approve this entry?"
                description="Are you sure you want to approve this onboarding entry?"
                onConfirm={() => handleApprove(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CheckCircleOutlined />}
                >
                  Approve
                </Button>
              </Popconfirm>
              <Button 
                danger 
                size="small" 
                icon={<CloseCircleOutlined />}
                onClick={() => openRejectModal(record.id)}
              >
                Reject
              </Button>
            </>
          )}
          {record.status !== 'Pending' && (
            <span style={{ color: '#999' }}>No actions available</span>
          )}
        </Space>
      ),
    },
  ]

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ fontSize: '20px', marginRight: '12px', color: '#1890ff' }} />
            <h2 style={{ margin: 0, color: '#1f2937' }}>Super Admin Dashboard</h2>
          </div>
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar 
                style={{ backgroundColor: '#1890ff', marginRight: '8px' }} 
                icon={<UserOutlined />} 
              />
              <span style={{ color: '#1f2937' }}>{adminUser?.name}</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: '24px' }}>
          {/* Stats Cards */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <Card>
                <Statistic
                  title="Total Entries"
                  value={stats.totalEntries}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Pending"
                  value={stats.pendingEntries}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Approved"
                  value={stats.approvedEntries}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Rejected"
                  value={stats.rejectedEntries}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </div>
          </div>

          {/* Entries Table */}
          <Card title="Onboarding Entries">
            <Table
              columns={columns}
              dataSource={entries}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} entries`,
              }}
            />
          </Card>

          {/* Rejection Modal */}
          <Modal
            title="Reject Entry"
            open={rejectionModalVisible}
            onOk={handleReject}
            onCancel={() => {
              setRejectionModalVisible(false)
              setRejectionReason('')
              setSelectedEntryId(null)
            }}
            okText="Reject"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <p style={{ marginBottom: '16px' }}>Please provide a reason for rejection:</p>
            <Input.TextArea
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Modal>
        </Content>
      </Layout>
    </ProtectedRoute>
  )
}

export default SuperAdminPage 