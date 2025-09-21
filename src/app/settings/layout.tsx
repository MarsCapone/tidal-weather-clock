import Breadcrumbs from '@/app/settings/components/common/Breadcrumbs'
import PageTitle from '@/app/settings/components/common/PageTitle'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Breadcrumbs />
      <div className="md:p-10">
        <PageTitle />
        {children}
      </div>
    </div>
  )
}
