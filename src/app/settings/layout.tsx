import Breadcrumbs from '@/app/settings/components/common/Breadcrumbs'
import PageTitle from '@/app/settings/components/common/PageTitle'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Breadcrumbs />
      <div className="p-10">
        <PageTitle />
        {children}
      </div>
    </div>
  )
}
