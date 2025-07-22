import { InputWithDescription } from '../components/forms/FormComponents'
import { useFeatureFlags } from '@/ui/hooks/useFeatureFlags'

export default function InternalSettings() {
  const ff = useFeatureFlags()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl pb-4">Clock Face</h2>
        <div className="flex gap-4">
          <InputWithDescription
            description={
              'Number of hours before and after high tide to show on the clock face.'
            }
            title={'High tide delta hours'}
          />
          <InputWithDescription
            description={
              'Number of hours before and after low tide to show on the clock face.'
            }
            title={'Low tide delta hours'}
          />
        </div>
      </div>
      <div>
        <h2 className="text-2xl pb-4">Feature Flags</h2>
        <div className="flex flex-col gap-1">
          {Object.entries(ff).map(([key, value]) => (
            <label className={'label'} key={key}>
              <input
                checked={value}
                className="checkbox checkbox-accent"
                disabled
                type="checkbox"
              />
              {key}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
