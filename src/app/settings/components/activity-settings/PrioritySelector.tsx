import { Input } from '@/app/settings/components/common/form'
import React, { HTMLProps, PropsWithChildren } from 'react'

export default function PrioritySelector(
  props: HTMLProps<HTMLInputElement> & PropsWithChildren,
) {
  const { children, ...rest } = props
  return (
    <div className="w-full">
      <Input
        title={'Priority'}
        className={''}
        outerClassName={''}
        inputProps={{
          ...rest,
          type: 'range',
          min: 1,
          max: 9,
          step: 1,
        }}
      />
      <div className="mt-2 flex justify-between px-2.5 text-xs">
        <span>|</span>
        <span>|</span>
        <span>|</span>
      </div>
      <div className="mt-2 flex justify-between px-2.5 text-xs">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
      {children}
    </div>
  )
}
