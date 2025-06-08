'use client'

import { useState, useEffect } from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'

interface Stats {
  totalEntries: number
  pendingEntries: number
  approvedEntries: number
  rejectedEntries: number
}

const SuperAdminPage = () => {
  const [stats, setStats] = useState<Stats>({ 
    totalEntries: 0, 
    pendingEntries: 0, 
    approvedEntries: 0, 
    rejectedEntries: 0 
  })
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchStats()
  }, [])

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

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Welcome back, {user?.name}!</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Companies"
              value={stats.totalEntries}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats.pendingEntries}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Approved Companies"
              value={stats.approvedEntries}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rejected Applications"
              value={stats.rejectedEntries}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Quick Actions" 
        style={{ marginTop: '24px' }}
      >
        <p>Use the sidebar menu to navigate to different sections:</p>
        <ul>
          <li>View and manage company applications in the <strong>Company List</strong></li>
          <li>Monitor overall statistics on this <strong>Dashboard</strong></li>
        </ul>
      </Card>
    </div>
  )
}

export default SuperAdminPage 