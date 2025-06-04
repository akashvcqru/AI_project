import { Button, Result } from 'antd'
import { useRouter } from 'next/navigation'

interface ConfirmationProps {
  onNext: () => void
  onPrev: () => void
}

const Confirmation = ({ onPrev }: ConfirmationProps) => {
  const router = useRouter()

  return (
    <Result
      status="success"
      title="Onboarding Completed Successfully!"
      subTitle="Your company profile has been created. You can now access all features."
      extra={[
        <Button
          key="dashboard"
          type="primary"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </Button>,
      ]}
    />
  )
}

export default Confirmation 