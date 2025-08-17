'use client'
import useTitle from '@/hooks/useTitle'
import { useFlags } from 'launchdarkly-react-client-sdk'

export default function PageTitle() {
  const title = useTitle()
  const { showSettingsTitle } = useFlags()

  return (
    <>
      {showSettingsTitle && (
        <div className="mb-4">
          {title && <h1 className="text-3xl">{title}</h1>}
        </div>
      )}
    </>
  )
}
