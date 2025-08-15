'use client'

import { DarkModeContext } from '@/utils/contexts'
import { MoonIcon, SunIcon } from 'lucide-react'
import React, { useContext } from 'react'

export default function ColorschemeToggle() {
  const { setIsDarkMode } = useContext(DarkModeContext)

  return (
    <div>
      <label className="flex cursor-pointer gap-2">
        <SunIcon height={20} />
        <input
          data-testid={'colorscheme-toggle'}
          id="theme-controller"
          className="toggle theme-controller"
          type="checkbox"
          value="night"
          onChange={(e) => {
            const isDark = e.target.checked
            setIsDarkMode(isDark)
          }}
        />
        <MoonIcon height={20} />
      </label>
    </div>
  )
}
