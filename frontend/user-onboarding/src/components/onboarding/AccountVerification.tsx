import { Form, Input, Button, Card, message } from 'antd'
import { useVerifyEmailMutation } from '@/features/onboardingApi'
import { useAppDispatch } from '@/store/hooks'
import { setStep, updateFormData } from '@/features/onboardingSlice'

interface AccountForm {
  email: string
}

export default function AccountVerification() {
  const dispatch = useAppDispatch()
  const [verifyEmail] = useVerifyEmailMutation()

  const onFinish = async (values: AccountForm) => {
    try {
      await verifyEmail({ email: values.email }).unwrap()
      message.success('Email verification successful')
      dispatch(updateFormData({ account: values }))
      dispatch(setStep(1))
    } catch (error) {
      message.error('Verification failed')
    }
  }

  return (
    <Card title="Account Verification">
      <Form
        name="account-verification"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
          >
            Verify Email
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
} 