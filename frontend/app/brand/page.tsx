'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Skeleton } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/app/store/hooks/useAuth'

const { Title } = Typography

interface ActivityEntry {
  id: number
  type: 'Order' | 'Document' | 'Payment'
  status: 'Pending' | 'Completed' | 'Failed'
  description: string
  date: string
}

export default function BrandDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingDocuments: 0,
    totalRevenue: 0,
    activeProjects: 0
  })
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([])

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setStats({
        totalOrders: 150,
        pendingDocuments: 5,
        totalRevenue: 250000,
        activeProjects: 8
      })
      setRecentActivity([
        {
          id: 1,
          type: 'Order',
          status: 'Completed',
          description: 'New order #12345 received',
          date: new Date().toISOString()
        },
        {
          id: 2,
          type: 'Document',
          status: 'Pending',
          description: 'Contract renewal document pending',
          date: new Date().toISOString()
        },
        {
          id: 3,
          type: 'Payment',
          status: 'Completed',
          description: 'Payment received for order #12345',
          date: new Date().toISOString()
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const columns: ColumnsType<ActivityEntry> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let icon = null
        switch (type) {
          case 'Order':
            icon = <ShoppingCartOutlined />
            break
          case 'Document':
            icon = <FileTextOutlined />
            break
          case 'Payment':
            icon = <DollarOutlined />
            break
        }
        return (
          <Space>
            {icon}
            {type}
          </Space>
        )
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default'
        let icon = null

        switch (status) {
          case 'Completed':
            color = 'success'
            icon = <CheckCircleOutlined />
            break
          case 'Failed':
            color = 'error'
            icon = <CloseCircleOutlined />
            break
          case 'Pending':
            color = 'warning'
            icon = <ClockCircleOutlined />
            break
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        )
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ]

  const renderSkeletonCards = () => (
    <Row gutter={[16, 16]} className="mb-6">
      {[1, 2, 3, 4].map((item) => (
        <Col xs={24} sm={12} lg={6} key={item}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>
  )

  const renderSkeletonTable = () => (
    <Card title="Recent Activity" className="mb-6">
      <Skeleton active paragraph={{ rows: 5 }} />
    </Card>
  )

  return (
    <>
      <Title level={2}>Welcome, {user?.companyName || 'Brand'}</Title>
      
      {/* Statistics Cards */}
      {loading ? (
        renderSkeletonCards()
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Documents"
                value={stats.pendingDocuments}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Projects"
                value={stats.activeProjects}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Activity Table */}
      {loading ? (
        renderSkeletonTable()
      ) : (
        <Card title="Recent Activity" className="mb-6">
          <Table
            columns={columns}
            dataSource={recentActivity}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}
    </>
  )
} 