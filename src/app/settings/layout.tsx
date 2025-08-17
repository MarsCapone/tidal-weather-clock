import Breadcrumbs from '@/app/settings/components/Breadcrumbs'
import PageTitle from '@/app/settings/components/PageTitle'

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
