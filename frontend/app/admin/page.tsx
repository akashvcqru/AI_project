'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography } from 'antd'
import { 
  TeamOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons'
import { useGetStatsQuery, useGetCompaniesQuery } from '@/app/store/services/adminApi'

const { Title } = Typography

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery()
  const { data: companies, isLoading: companiesLoading } = useGetCompaniesQuery()

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Director Name',
      dataIndex: 'directorName',
      key: 'directorName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default'
        let icon = null

        switch (status) {
          case 'Approved':
            color = 'success'
            icon = <CheckCircleOutlined />
            break
          case 'Rejected':
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
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ]

  // Demo data for statistics
  const demoStats = {
    totalEntries: 150,
    pendingEntries: 45,
    approvedEntries: 85,
    rejectedEntries: 20
  }

  // Demo data for companies
  const demoCompanies = [
    {
      id: 1,
      companyName: 'Tech Solutions Inc',
      directorName: 'John Doe',
      email: 'john@techsolutions.com',
      status: 'Approved',
      createdAt: '2024-03-15T10:30:00Z'
    },
    {
      id: 2,
      companyName: 'Global Innovations',
      directorName: 'Jane Smith',
      email: 'jane@globalinnovations.com',
      status: 'Pending',
      createdAt: '2024-03-16T14:20:00Z'
    },
    {
      id: 3,
      companyName: 'Future Systems',
      directorName: 'Mike Johnson',
      email: 'mike@futuresystems.com',
      status: 'Rejected',
      createdAt: '2024-03-14T09:15:00Z'
    }
  ]

  return (
    <div className="p-6">
      <Title level={2}>Dashboard</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Companies"
              value={demoStats.totalEntries}
              prefix={<TeamOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={demoStats.pendingEntries}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved Companies"
              value={demoStats.approvedEntries}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rejected Companies"
              value={demoStats.rejectedEntries}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Companies Table */}
      <Card title="Recent Companies" className="mb-6">
        <Table
          columns={columns}
          dataSource={demoCompanies}
          loading={companiesLoading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  )
} 