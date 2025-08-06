import { MoonIcon, SunIcon } from 'lucide-react'
import React from 'react'

export default function ColorschemeToggle({
  setIsDarkMode,
}: {
  setIsDarkMode: (isDark: boolean) => void
}) {
  return (
    <div>
      <label className="flex cursor-pointer gap-2">
        <SunIcon height={20} />
        <input
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

export function isDarkMode(): boolean {
  const element = document.getElementById(
    'theme-controller',
  ) as HTMLInputElement
  return element.checked
}
