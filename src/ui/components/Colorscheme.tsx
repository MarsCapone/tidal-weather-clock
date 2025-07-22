import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import React from 'react'

export default function ColorschemeToggle() {
  return (
    <div>
      <label className="flex cursor-pointer gap-2">
        <SunIcon height={20} />
        <input
          className="toggle theme-controller"
          type="checkbox"
          value="night"
        />
        <MoonIcon height={20} />
      </label>
    </div>
  )
}
