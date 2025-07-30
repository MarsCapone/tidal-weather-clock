import { SettingTitle } from '@/app/settings/components/common'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { sentenceCase } from 'change-case'
import { PencilIcon } from 'lucide-react'

export default function FeatureFlagSettings() {
  const ff = useFeatureFlags()

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <SettingTitle title={'Feature Flags'} />
        <div
          className="tooltip"
          data-tip="feature flags are not yet editable from the UI"
        >
          <button className="btn btn-disabled rounded-field aspect-square">
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(ff).map(([key, value]) => {
          return (
            <div className="label" key={key}>
              <input
                checked={value}
                className="checkbox checkbox-xl checkbox-secondary rounded-field"
                disabled
                readOnly
                type="checkbox"
              />
              {sentenceCase(key)}{' '}
              <span className="font-mono text-xs">({key})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
