import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import React from 'react'

export default function ColorschemeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  function toggleDarkMode() {
    const added = document.documentElement.classList.toggle('dark')
    setIsDark(added)
  }

  const Icon = isDark ? SunIcon : MoonIcon

  return (
    <div className="w-6 h-6 m-3">
      <Icon className="size-6" onClick={toggleDarkMode} />
    </div>
  )
}
