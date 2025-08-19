'use client'
import Link from 'next/link'
import React, { useState } from 'react'

export type SettingsMenuProps = {
  links: {
    id: string
    label: string
  }[]
}

export default function SettingsMenu({ links }: SettingsMenuProps) {
  const [hash, setHash] = useState('')

  return (
    <div className="sticky top-10 flex w-full flex-col gap-4">
      <ul className="menu bg-base-200 rounded-box w-full">
        <li className="menu-title">Settings</li>
        {links.map((link) => {
          const linkHash = `#${link.id}`

          return (
            <li key={`link-${link.id}`}>
              <Link
                className={hash === linkHash ? 'menu-active' : ''}
                href={linkHash}
                onClick={() => setHash(linkHash)}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
