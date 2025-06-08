'use client'

import { useState, useEffect } from 'react'
import { Table, Card, Tag, Space, Button, message, Modal, Input } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface CompanyEntry {
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

const CompaniesPage = () => {
  const [entries, setEntries] = useState<CompanyEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://localhost:7001/api/Admin/onboarding-entries')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      } else {
        message.error('Failed to fetch company entries')
      }
    } catch (error) {
      message.error('Error fetching entries')
    } finally {
      setLoading(false)
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
        message.success('Company approved successfully!')
        fetchEntries()
      } else {
        message.error('Failed to approve company')
      }
    } catch (error) {
      message.error('Error approving company')
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
        message.success('Company rejected successfully!')
        setRejectionModalVisible(false)
        setRejectionReason('')
        setSelectedEntryId(null)
        fetchEntries()
      } else {
        message.error('Failed to reject company')
      }
    } catch (error) {
      message.error('Error rejecting company')
    }
  }

  const openRejectModal = (id: number) => {
    setSelectedEntryId(id)
    setRejectionModalVisible(true)
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

  const columns: ColumnsType<CompanyEntry> = [
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
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
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
    <Card title="Company List">
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
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} companies`,
        }}
      />

      <Modal
        title="Reject Company"
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
    </Card>
  )
}

export default CompaniesPage 