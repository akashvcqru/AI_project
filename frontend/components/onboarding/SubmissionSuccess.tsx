import { Result, Button } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

interface SubmissionSuccessProps {
  onPrev?: () => void
}

const SubmissionSuccess = ({ onPrev }: SubmissionSuccessProps) => {
  const router = useRouter()

  return (
    <Result
      icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
      status="success"
      title="Your request has been submitted successfully!"
      subTitle="Your documents are under process. We will notify you once the verification is complete."
      extra={[
        <Button
          key="home"
          type="primary"
          onClick={() => router.push('/')}
        >
          Go to Home
        </Button>,
        <Button
          key="new"
          onClick={() => {
            // Reload the page to start a new onboarding process
            window.location.reload()
          }}
        >
          Start New Application
        </Button>,
      ]}
    >
      <div>
        <h4 style={{ marginBottom: '16px' }}>What happens next?</h4>
        <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
          <li>Our team will review your submitted documents</li>
          <li>You will receive an email notification about the status</li>
          <li>The verification process typically takes 2-3 business days</li>
          <li>Once approved, you will get access to all platform features</li>
        </ul>
      </div>
    </Result>
  )
}

export default SubmissionSuccess 