'use client'

import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import {
  Fieldset,
  Input,
  PrefixSuffixInput,
} from '@/components/forms/FormComponents'
import {
  Activity,
  Constraint,
  SunConstraint,
  TideConstraint,
  TimeConstraint,
  WeatherConstraint,
  WindConstraint,
} from '@/lib/types/activity'
import { DarkModeContext } from '@/lib/utils/contexts'
import { fractionalUtcToLocalTimeString } from '@/lib/utils/dates'
import logger from '@/lib/utils/logger'
import { capitalize } from '@/lib/utils/string'
import diff from 'diff-arrays-of-objects'
import {
  FilterFunction,
  githubDarkTheme,
  githubLightTheme,
  JsonEditor,
  JsonEditorProps,
} from 'json-edit-react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useFieldArray, useForm } from 'react-hook-form'
import SingleActivityForm from '@/app/settings/components/activity-settings/SingleActivityForm'
import { InputActivities } from '@/app/settings/components/activity-settings/types'

export type ActivitySettingsFormProps = {
  userId: string
  activities: Activity[]
  setActivitiesAction: (activities: Activity[]) => void
}
export default function ActivitySettingsForm({
  userId,
  activities,
  setActivitiesAction,
}: ActivitySettingsFormProps) {
  const defaultValues = {
    activities,
  }
  const { control, register, handleSubmit, getValues, reset, setValue } =
    useForm<InputActivities>({
      defaultValues,
    })

  const { fields, append, remove, prepend } = useFieldArray({
    control,
    name: 'activities',
  })

  const onSubmit = (data) => console.log(data)

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-row items-center justify-between">
          <SettingTitle title={'Activity Settings'} />
          <div className="flex gap-2">
            <button className="btn btn-primary rounded-field">
              Add Activity <PlusIcon className="h-4 w-4" />
            </button>
            <div className="indicator">
              <span className="indicator-item badge badge-neutral">count</span>
              <button
                type={'submit'}
                className={`btn btn-secondary rounded-field`}
              >
                Save Changes
              </button>
            </div>
            <div>
              <button
                className="btn btn-accent rounded-field"
                onClick={() => reset(defaultValues)}
              >
                Cancel Changes
              </button>
            </div>
          </div>
        </div>
        <ul>
          {fields.map((item, index) => {
            return (
              <li key={item.id}>
                <SingleActivityForm
                  index={index}
                  control={control}
                  register={register}
                  getValues={getValues}
                />
              </li>
            )
          })}
        </ul>
        <button
          className={'btn'}
          onClick={() =>
            prepend({
              id: uuidv4(),
              name: 'Sample Activity',
              description: 'description here',
              priority: 5,
              scope: 'user',
              constraints: [],
            })
          }
        >
          Add Activity
        </button>
      </form>
    </div>
  )
}
