'use client'

import { Breadcrumb as AntBreadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const routeMap: { [key: string]: string } = {
  'dashboard': 'Dashboard',
  'companies': 'Company List',
  'profile': 'Profile',
  'change-password': 'Change Password'
}

const AdminBreadcrumb = () => {
  const pathname = usePathname()
  
  // Don't show breadcrumb on dashboard
  if (pathname === '/admin/dashboard') {
    return null
  }

  const paths = pathname.split('/').filter(Boolean)
  
  // Remove 'admin' from the paths
  const breadcrumbPaths = paths.slice(1)

  const items = [
    {
      title: (
        <Link href="/admin/">
          <HomeOutlined />
        </Link>
      )
    },
    ...breadcrumbPaths.map((path, index) => {
      const isLast = index === breadcrumbPaths.length - 1
      const href = `/admin/${path}`
      const title = routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

      return {
        title: isLast ? (
          <span className="text-gray-600">{title}</span>
        ) : (
          <Link href={href} className="text-blue-600 hover:text-blue-800">
            {title}
          </Link>
        )
      }
    })
  ]

  return (
    <AntBreadcrumb 
      items={items}
      className="mb-4"
    />
  )
}

export default AdminBreadcrumb 