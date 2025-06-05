import { Result, Button, Typography, List, Card } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Title } = Typography

interface SubmissionSuccessProps {
  onPrev?: () => void
}

const SubmissionSuccess = ({ onPrev }: SubmissionSuccessProps) => {
  const router = useRouter()

  const nextSteps = [
    'Our team will review your submitted documents',
    'You will receive an email notification about the status',
    'The verification process typically takes 2-3 business days',
    'Once approved, you will get access to all platform features'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <Result
            icon={<CheckCircleOutlined className="text-green-500 text-7xl" />}
            status="success"
            title="Your request has been submitted successfully!"
            subTitle="Your documents are under process. We will notify you once the verification is complete."
            extra={[
              <Button
                key="home"
                type="primary"
                onClick={() => router.push('/')}
                className="mr-2"
              >
                Go to Home
              </Button>,
              <Button
                key="new"
                onClick={() => window.location.reload()}
              >
                Start New Application
              </Button>,
            ]}
          >
            <div className="mt-6 text-left">
              <Title level={4}>What happens next?</Title>
              <List
                dataSource={nextSteps}
                renderItem={(item) => (
                  <List.Item className="text-gray-700">{item}</List.Item>
                )}
              />
            </div>
          </Result>
        </Card>
      </div>
    </div>
  )
}

export default SubmissionSuccess
