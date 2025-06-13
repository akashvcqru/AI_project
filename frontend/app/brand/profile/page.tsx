'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Typography, Row, Col, Upload, Avatar, Tabs, Space, Divider, Descriptions } from 'antd'
import {
  UserOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BankOutlined,
  IdcardOutlined,
  GlobalOutlined,
  TeamOutlined,
  FileTextOutlined,
  LockOutlined,
  KeyOutlined
} from '@ant-design/icons'
import { useAuth } from '@/app/store/hooks/useAuth'
import type { UploadProps } from 'antd'

const { Title, Text } = Typography

interface CompanyProfile {
  // Company Details
  companyName: string
  tradeName: string
  gstNumber: string
  panNumber: string
  category: string
  city: string
  state: string
  fssiNo: string
  msmeNo: string
  logo?: string

  // Director Details
  directorName: string
  directorPan: string
  directorFatherName: string
  directorAadhar: string
  officialAddress: string
  residentialAddress: string
  directorPhoto?: string
  directorSignature?: string

  // Documents
  addressDocument?: string
  authorizedPersonDocument?: string
  signatureDocument?: string

  // Contact Details
  email: string
  phone: string
  address: string
  pincode: string
  website?: string
  lastLogin?: string
}

export default function BrandProfilePage() {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('1')
  const [editMode, setEditMode] = useState({
    company: false,
    director: false,
    documents: false,
    password: false
  })
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    tradeName: '',
    gstNumber: '',
    panNumber: '',
    category: '',
    city: '',
    state: '',
    fssiNo: '',
    msmeNo: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    website: '',
    directorName: '',
    directorPan: '',
    directorFatherName: '',
    directorAadhar: '',
    officialAddress: '',
    residentialAddress: '',
    lastLogin: new Date().toLocaleString()
  })

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      const mockProfile: CompanyProfile = {
        companyName: 'VCQRU Private Limited',
        tradeName: 'VCQRU Pvt Ltd',
        gstNumber: '06AAICV2277KIZ',
        panNumber: 'HLKPK7865B',
        category: 'Electronic',
        city: 'Gurugram',
        state: 'Haryana',
        fssiNo: '23874XXXY2',
        msmeNo: '878SSSJHSD',
        email: 'sales@vcqru.com',
        phone: '+91 9958644640',
        address: 'Sec-6 Gurugram',
        pincode: '122004',
        website: 'www.vcqru.com',
        directorName: 'Mohit Karma',
        directorPan: 'HLKPK7865B',
        directorFatherName: 'Rishab Karma',
        directorAadhar: '97AJH67S2233',
        officialAddress: 'Sec-6 Gurugram',
        residentialAddress: 'Pritampura, Delhi',
        lastLogin: '12 Jan 2024, 8:55 AM'
      }
      setProfile(mockProfile)
      form.setFieldsValue(mockProfile) // Set form values on load
    }, 1000)
  }, [user, form])

  const handleProfileUpdate = async (values: CompanyProfile) => {
    try {
      setLoading(true)
      // Here you would typically make an API call to update the profile
      console.log('Updating profile:', values)
      setProfile(values) // Update local state with new values
      message.success('Profile updated successfully!')
      setEditMode({
        company: false,
        director: false,
        documents: false,
        password: false
      })
    } catch (error) {
      message.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = (section: keyof typeof editMode) => {
    setEditMode(prev => ({ ...prev, [section]: false }))
    form.setFieldsValue(profile) // Reset form to current profile values
  }

  const renderProfileHeader = () => (
    <Card
      className="bg-blue-700 mb-5"
    >
      <Row align="middle">
        <Col>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            src={profile.logo}
            className="border-2 border-white shadow-md"
          />
        </Col>
        <Col flex="1" className="px-4">
          <Title level={4} className="!text-white !mb-1">
            {profile.companyName}
          </Title>
          <Row gutter={[16, 8]}>
            <Col>
              <Space>
                <EnvironmentOutlined className="text-blue-200" />
                <Text className="text-blue-200">{profile.address}, {profile.city}</Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <MailOutlined className="text-blue-200" />
                <Text className="text-blue-200">{profile.email}</Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <PhoneOutlined className="text-blue-200" />
                <Text className="text-blue-200">{profile.phone}</Text>
              </Space>
            </Col>
          </Row>
        </Col>
        <Col>
          <Space direction="vertical" size={0} align="end">
            <Text className="text-blue-200 text-sm">Last Login</Text>
            <Text className="text-white">{profile.lastLogin}</Text>
          </Space>
        </Col>
      </Row>
    </Card>
  )

  const renderCompanyDetails = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-1.5">
        <Title level={5} className="!mb-0">Company Details</Title>
        {!editMode.company ? (
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => setEditMode(prev => ({ ...prev, company: true }))}
          >
            Edit
          </Button>
        ) : (
          <Space size="small">
            <Button
              onClick={() => handleCancelEdit('company')}
              icon={<CloseOutlined />}
              size="small"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              form="company-details-form"
              size="small"
            >
              Save Changes
            </Button>
          </Space>
        )}
      </div>

      {editMode.company ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={profile}
          id="company-details-form"
        >
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}>
                <Input prefix={<BankOutlined />} placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="tradeName"
                label="Trade Name"
                rules={[{ required: true, message: 'Please enter trade name' }]}>
                <Input prefix={<GlobalOutlined />} placeholder="Enter trade name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gstNumber"
                label="GSTIN No"
                rules={[{ required: true, message: 'Please enter GSTIN number' }]}>
                <Input placeholder="Enter GSTIN number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="panNumber"
                label="Company PAN/TAN No"
                rules={[{ required: true, message: 'Please enter company PAN/TAN number' }]}>
                <Input placeholder="Enter Company PAN/TAN number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category">
                <Input placeholder="Enter category" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}>
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}>
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="fssiNo"
                label="Fssi No">
                <Input placeholder="Enter Fssi number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="msmeNo"
                label="MSME No">
                <Input placeholder="Enter MSME number" />
              </Form.Item>
            </Col>
          </Row>
          <Divider className="my-4" />
          <Title level={5} className="!mb-1.5">Contact Details</Title>
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Please enter email', type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}>
                <Input.TextArea prefix={<EnvironmentOutlined />} placeholder="Enter address" rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}>
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}>
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[{ required: true, message: 'Please enter pincode' }]}>
                <Input placeholder="Enter pincode" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="website"
                label="Website">
                <Input prefix={<GlobalOutlined />} placeholder="Enter website URL" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Company Logo">
                <Upload
                  name="logo"
                  action="/api/upload"
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} uploaded successfully`)
                      setProfile(prev => ({ ...prev, logo: info.file.response.url }))
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} upload failed.`)
                    }
                  }}>
                  <Button icon={<UploadOutlined />}>Upload Logo</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 4 }} className="ant-descriptions-custom">
          <Descriptions.Item label="Company PAN/TAN No">{profile.panNumber}</Descriptions.Item>
          <Descriptions.Item label="GSTIN No">{profile.gstNumber}</Descriptions.Item>
          <Descriptions.Item label="Name">{profile.companyName}</Descriptions.Item>
          <Descriptions.Item label="Category">{profile.category}</Descriptions.Item>
          <Descriptions.Item label="City">{profile.city}</Descriptions.Item>
          <Descriptions.Item label="State">{profile.state}</Descriptions.Item>
          <Descriptions.Item label="Fssi No">{profile.fssiNo}</Descriptions.Item>
          <Descriptions.Item label="MSME No">{profile.msmeNo}</Descriptions.Item>
        </Descriptions>
      )}
    </div>
  )

  const renderDirectorDetails = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-1.5">
        <Title level={5} className="!mb-0">Director's Details</Title>
        {!editMode.director ? (
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => setEditMode(prev => ({ ...prev, director: true }))}>
            Edit
          </Button>
        ) : (
          <Space size="small">
            <Button
              onClick={() => handleCancelEdit('director')}
              icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              form="director-details-form"
              size="small"
            >
              Save Changes
            </Button>
          </Space>
        )}
      </div>

      {editMode.director ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={profile}
          id="director-details-form">
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="directorName"
                label="Director Name"
                rules={[{ required: true, message: 'Please enter director name' }]}>
                <Input prefix={<UserOutlined />} placeholder="Enter director name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="directorPan"
                label="Director's PAN"
                rules={[{ required: true, message: 'Please enter director PAN' }]}>
                <Input placeholder="Enter director PAN" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="directorFatherName"
                label="Director's Father Name">
                <Input placeholder="Enter director's father name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="directorAadhar"
                label="Director's Aadhar No"
                rules={[{ required: true, message: 'Please enter director Aadhar number' }]}>
                <Input placeholder="Enter director Aadhar number" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="officialAddress"
                label="Official Address"
                rules={[{ required: true, message: 'Please enter official address' }]}>
                <Input.TextArea prefix={<EnvironmentOutlined />} placeholder="Enter official address" rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="residentialAddress"
                label="Residential Address"
                rules={[{ required: true, message: 'Please enter residential address' }]}>
                <Input.TextArea prefix={<EnvironmentOutlined />} placeholder="Enter residential address" rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Director Photo">
                <Upload
                  name="directorPhoto"
                  action="/api/upload"
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} uploaded successfully`)
                      setProfile(prev => ({ ...prev, directorPhoto: info.file.response.url }))
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} upload failed.`)
                    }
                  }}>
                  <Button icon={<UploadOutlined />}>Upload Photo</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Director Signature">
                <Upload
                  name="directorSignature"
                  action="/api/upload"
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} uploaded successfully`)
                      setProfile(prev => ({ ...prev, directorSignature: info.file.response.url }))
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} upload failed.`)
                    }
                  }}>
                  <Button icon={<UploadOutlined />}>Upload Signature</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3, lg: 4 }} className="ant-descriptions-custom">
          <Descriptions.Item label="Director's Name">{profile.directorName}</Descriptions.Item>
          <Descriptions.Item label="Director's PAN">{profile.directorPan}</Descriptions.Item>
          <Descriptions.Item label="Director's Father Name">{profile.directorFatherName}</Descriptions.Item>
          <Descriptions.Item label="Director's Aadhar No">{profile.directorAadhar}</Descriptions.Item>
          <Descriptions.Item label="Official Address">{profile.officialAddress}</Descriptions.Item>
          <Descriptions.Item label="Residential Address">{profile.residentialAddress}</Descriptions.Item>
        </Descriptions>
      )}
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-1.5">
        <Title level={5} className="!mb-0">Company Documents</Title>
        {!editMode.documents ? (
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => setEditMode(prev => ({ ...prev, documents: true }))}>
            Edit
          </Button>
        ) : (
          <Space size="small">
            <Button
              onClick={() => handleCancelEdit('documents')}
              icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              form="documents-form"
              size="small"
            >
              Save Changes
            </Button>
          </Space>
        )}
      </div>

      {editMode.documents ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={profile}
          id="documents-form">
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Form.Item label="Address Document">
                <Upload
                  name="addressDocument"
                  action="/api/upload"
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} uploaded successfully`)
                      setProfile(prev => ({ ...prev, addressDocument: info.file.response.url }))
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} upload failed.`)
                    }
                  }}>
                  <Button icon={<UploadOutlined />}>Upload Address Document</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Authorized Person Document">
                <Upload
                  name="authorizedPersonDocument"
                  action="/api/upload"
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} uploaded successfully`)
                      setProfile(prev => ({ ...prev, authorizedPersonDocument: info.file.response.url }))
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} upload failed.`)
                    }
                  }}>
                  <Button icon={<UploadOutlined />}>Upload Authorized Person Document</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Signature Document">
                <Upload
                  name="signatureDocument"
                  action="/api/upload"
                  showUploadList={false}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} uploaded successfully`)
                      setProfile(prev => ({ ...prev, signatureDocument: info.file.response.url }))
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} upload failed.`)
                    }
                  }}>
                  <Button icon={<UploadOutlined />}>Upload Signature Document</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
          <div className="flex items-center space-x-3 p-1.5 border rounded-lg">
            <img
              src="https://cdn-icons-png.flaticon.com/512/888/888034.png"
              alt="Doc"
              className="w-10 h-10" />
            <div>
              <Title level={5} className="!mb-0 !text-base">Address Document</Title>
              {profile.addressDocument ? (
                <a href={profile.addressDocument} target="_blank" className="text-blue-600 !text-sm">View</a>
              ) : (
                <Text type="secondary" className="!text-sm">Not uploaded</Text>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3 p-1.5 border rounded-lg">
            <img
              src="https://cdn-icons-png.flaticon.com/512/888/888034.png"
              alt="Doc"
              className="w-10 h-10" />
            <div>
              <Title level={5} className="!mb-0 !text-base">Authorised Person/Document</Title>
              {profile.authorizedPersonDocument ? (
                <a href={profile.authorizedPersonDocument} target="_blank" className="text-blue-600 !text-sm">View</a>
              ) : (
                <Text type="secondary" className="!text-sm">Not uploaded</Text>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3 p-1.5 border rounded-lg">
            <img
              src="https://cdn-icons-png.flaticon.com/512/888/888034.png"
              alt="Doc"
              className="w-10 h-10" />
            <div>
              <Title level={5} className="!mb-0 !text-base">Signature Documents</Title>
              {profile.signatureDocument ? (
                <a href={profile.signatureDocument} target="_blank" className="text-blue-600 !text-sm">View</a>
              ) : (
                <Text type="secondary" className="!text-sm">Not uploaded</Text>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderChangePassword = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-1.5">
        <Title level={5} className="!mb-0">Change Password</Title>
        {!editMode.password ? (
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => setEditMode(prev => ({ ...prev, password: true }))}>
            Edit
          </Button>
        ) : (
          <Space size="small">
            <Button
              onClick={() => handleCancelEdit('password')}
              icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}>
              Submit
            </Button>
          </Space>
        )}
      </div>
      {editMode.password ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileUpdate}
          id="change-password-form">
          <Row gutter={[12, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="oldPassword"
                label="Old Password"
                rules={[{ required: true, message: 'Please enter your old password!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Enter old password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter your new password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                  { pattern: /[A-Z]/, message: 'Password must include an uppercase letter!' },
                  { pattern: /[a-z]/, message: 'Password must include a lowercase letter!' },
                  { pattern: /[0-9]/, message: 'Password must include a number!' },
                  { pattern: /[^a-zA-Z0-9]/, message: 'Password must include a special character!' },
                ]}>
                <Input.Password prefix={<KeyOutlined />} placeholder="Enter new password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('The two passwords do not match!'))
                    },
                  }),
                ]}>
                <Input.Password prefix={<KeyOutlined />} placeholder="Confirm new password" />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => handleCancelEdit('password')}
              icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}>
              Submit
            </Button>
          </div>
        </Form>
      ) : (
        <div className="text-center py-6 text-gray-600">
          <LockOutlined className="text-3xl mb-3" />
          <Title level={5}>Manage Your Password</Title>
          <Text className="!text-sm">Click 'Edit' to change your password securely.</Text>
        </div>
      )}
    </div>
  )

  return (
    <>
      {renderProfileHeader()}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarGutter={8}
          items={[
            {
              key: '1',
              label: 'Company Details',
              children: renderCompanyDetails()
            },
            {
              key: '2',
              label: 'Director\'s Details',
              children: renderDirectorDetails()
            },
            {
              key: '3',
              label: 'Company Documents',
              children: renderDocuments()
            },
            {
              key: '4',
              label: 'Change Password',
              children: renderChangePassword()
            }
          ]}
        />
      </Card>
    </>
  )
} 