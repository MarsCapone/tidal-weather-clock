import { InputWithDescription } from '../components/forms/FormComponents'
import { useState } from 'react'
import { useFeatureFlags } from '@/utils/featureFlags'

export default function InternalSettings() {
  const ff = useFeatureFlags()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl pb-4">Clock Face</h2>
        <div className="flex gap-4">
          <InputWithDescription
            title={'High tide delta hours'}
            description={
              'Number of hours before and after high tide to show on the clock face.'
            }
          />
          <InputWithDescription
            title={'Low tide delta hours'}
            description={
              'Number of hours before and after low tide to show on the clock face.'
            }
          />
        </div>
      </div>
      <div>
        <h2 className="text-2xl pb-4">Feature Flags</h2>
        <div className="flex flex-col gap-1">
          {Object.entries(ff).map(([key, value]) => (
            <label className={'label'}>
              <input
                className="checkbox checkbox-accent"
                type="checkbox"
                checked={value}
                disabled
              />
              {key}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
