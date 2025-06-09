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

  return (
    <>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Companies"
              value={stats?.totalEntries || 0}
              prefix={<TeamOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats?.pendingEntries || 0}
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
              value={stats?.approvedEntries || 0}
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
              value={stats?.rejectedEntries || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Recent Companies">
        <Table
          columns={columns}
          dataSource={companies}
          loading={companiesLoading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </>
  )
} 