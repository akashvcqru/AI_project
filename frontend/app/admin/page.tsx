'use client'

import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Skeleton } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useGetStatsQuery, useGetCompaniesQuery } from '@/app/store/services/adminApi'

const { Title } = Typography

interface CompanyEntry {
  id: number
  email: string
  companyName: string
  directorName: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery()
  const { data: companies, isLoading: companiesLoading } = useGetCompaniesQuery()

  const columns: ColumnsType<CompanyEntry> = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName),
    },
    {
      title: 'Director Name',
      dataIndex: 'directorName',
      key: 'directorName',
      sorter: (a, b) => a.directorName.localeCompare(b.directorName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
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
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
    <Card title="Recent Companies" className="mb-6">
      <Skeleton active paragraph={{ rows: 5 }} />
    </Card>
  )

  return (
    <>
      <Title level={2}>Dashboard</Title>
      
      {/* Statistics Cards */}
      {statsLoading ? (
        renderSkeletonCards()
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Companies"
                value={stats?.totalEntries || 0}
                prefix={<TeamOutlined />}
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
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Companies Table */}
      {companiesLoading ? (
        renderSkeletonTable()
      ) : (
        <Card title="Recent Companies" className="mb-6">
          <Table
            columns={columns}
            dataSource={companies}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}
    </>
  )
} 