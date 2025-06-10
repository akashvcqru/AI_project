import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Login | VCQRU',
  description: 'Login to your VCQRU brand dashboard',
}

export default function BrandLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 