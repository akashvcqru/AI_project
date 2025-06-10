'use client'

import { useState, useEffect } from 'react'
import { Table, Card, Tag, Space, Button, message, Modal, Input, Popconfirm } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface CompanyEntry {
  id: number
  // Account Verification
  email: string
  mobileNumber: string
  
  // E-KYC
  gstNumber: string
  gstRegistrationCertificate: string // URL or base64 of the certificate
  
  // Company Details
  companyName: string
  tradeName: string
  address: string
  city: string
  state: string
  pincode: string
  
  // Director Details
  directorName: string
  panNumber: string
  panCardImage: string // URL or base64 of the PAN card
  aadharNumber: string
  designation: string
  directorAddress: string
  directorPhoto: string // URL or base64 of the photo
  directorSignature: string // URL or base64 of the signature
  
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
        // Send approval email
        const emailResponse = await fetch(`https://localhost:7001/api/Admin/send-approval-email/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (emailResponse.ok) {
          message.success('Company approved and notification email sent successfully!')
        } else {
          message.warning('Company approved but failed to send notification email')
        }
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
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
      render: (id) => id || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      render: (email) => email || 'N/A'
    },
    {
      title: 'Mobile',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      width: 120,
      sorter: (a, b) => (a.mobileNumber || '').localeCompare(b.mobileNumber || ''),
      render: (mobile) => mobile || 'N/A'
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 180,
      sorter: (a, b) => (a.companyName || '').localeCompare(b.companyName || ''),
      render: (name) => name || 'N/A'
    },
    {
      title: 'Trade Name',
      dataIndex: 'tradeName',
      key: 'tradeName',
      width: 180,
      sorter: (a, b) => (a.tradeName || '').localeCompare(b.tradeName || ''),
      render: (name) => name || 'N/A'
    },
    {
      title: 'GST Number',
      dataIndex: 'gstNumber',
      key: 'gstNumber',
      width: 150,
      sorter: (a, b) => (a.gstNumber || '').localeCompare(b.gstNumber || ''),
      render: (gst) => gst || 'N/A'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
      render: (address) => address || 'N/A'
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      sorter: (a, b) => (a.city || '').localeCompare(b.city || ''),
      render: (city) => city || 'N/A'
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      sorter: (a, b) => (a.state || '').localeCompare(b.state || ''),
      render: (state) => state || 'N/A'
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      key: 'pincode',
      width: 100,
      sorter: (a, b) => (a.pincode || '').localeCompare(b.pincode || ''),
      render: (pincode) => pincode || 'N/A'
    },
    {
      title: 'Director Name',
      dataIndex: 'directorName',
      key: 'directorName',
      width: 150,
      sorter: (a, b) => (a.directorName || '').localeCompare(b.directorName || ''),
      render: (name) => name || 'N/A'
    },
    {
      title: 'PAN Number',
      dataIndex: 'panNumber',
      key: 'panNumber',
      width: 120,
      sorter: (a, b) => (a.panNumber || '').localeCompare(b.panNumber || ''),
      render: (pan) => pan || 'N/A'
    },
    {
      title: 'Aadhar Number',
      dataIndex: 'aadharNumber',
      key: 'aadharNumber',
      width: 120,
      sorter: (a, b) => (a.aadharNumber || '').localeCompare(b.aadharNumber || ''),
      render: (aadhar) => aadhar || 'N/A'
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 120,
      sorter: (a, b) => (a.designation || '').localeCompare(b.designation || ''),
      render: (designation) => designation || 'N/A'
    },
    {
      title: 'Director Address',
      dataIndex: 'directorAddress',
      key: 'directorAddress',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => (a.directorAddress || '').localeCompare(b.directorAddress || ''),
      render: (address) => address || 'N/A'
    },
    {
      title: 'GST Certificate',
      dataIndex: 'gstRegistrationCertificate',
      key: 'gstRegistrationCertificate',
      width: 120,
      render: (url) => url ? (
        <Button type="link" onClick={() => window.open(url, '_blank')}>
          View Certificate
        </Button>
      ) : 'N/A'
    },
    {
      title: 'PAN Card',
      dataIndex: 'panCardImage',
      key: 'panCardImage',
      width: 120,
      render: (url) => url ? (
        <Button type="link" onClick={() => window.open(url, '_blank')}>
          View PAN Card
        </Button>
      ) : 'N/A'
    },
    {
      title: 'Director Photo',
      dataIndex: 'directorPhoto',
      key: 'directorPhoto',
      width: 120,
      render: (url) => url ? (
        <Button type="link" onClick={() => window.open(url, '_blank')}>
          View Photo
        </Button>
      ) : 'N/A'
    },
    {
      title: 'Director Signature',
      dataIndex: 'directorSignature',
      key: 'directorSignature',
      width: 120,
      render: (url) => url ? (
        <Button type="link" onClick={() => window.open(url, '_blank')}>
          View Signature
        </Button>
      ) : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => status ? getStatusTag(status) : 'N/A',
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'Pending' && (
            <>
              <Popconfirm
                title="Approve Company"
                description="Are you sure you want to approve this company?"
                onConfirm={() => handleApprove(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ type: 'primary' }}
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
            <span className="text-gray-500">No actions available</span>
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
        scroll={{ x: 2000 }}
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