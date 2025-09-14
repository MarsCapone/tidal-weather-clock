'use client'

import { DarkModeContext } from '@/lib/utils/contexts'
import { MoonIcon, SunIcon } from 'lucide-react'
import React, { useContext } from 'react'

export default function ColorschemeToggle() {
  const { setIsDarkMode } = useContext(DarkModeContext)

  return (
    <div>
      <label className="flex cursor-pointer gap-2">
        <SunIcon className={'h-4 w-4 md:h-6 md:w-6'} />
        <input
          data-testid={'colorscheme-toggle'}
          id="theme-controller"
          className="toggle toggle-xs md:toggle-md theme-controller"
          type="checkbox"
          value="night"
          onChange={(e) => {
            const isDark = e.target.checked
            setIsDarkMode(isDark)
          }}
        />
        <MoonIcon className={'h-4 w-4 md:h-6 md:w-6'} />
      </label>
    </div>
  )
}
