'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Page() {
  const [hash, setHash] = useState('#activities')

  const links = [
    { Component: LongComponent, id: 'activities', label: 'Activities' },
    { id: 'more settings', label: 'More settings' },
  ]

  return (
    <div className="flex flex-row justify-center text-start">
      <div className="w-1/4">
        <ul className="menu bg-base-200 rounded-box sticky top-10 w-56">
          <li className="menu-title">Settings</li>
          {links.map((link) => {
            const linkHash = `#${link.id}`

            return (
              <li
                className={link.Component === undefined ? 'menu-disabled' : ''}
                key={`link-${link.id}`}
              >
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
      <div className="w-1/2">
        {links.map(({ Component, id }) => {
          if (Component) {
            return (
              <div id={id} key={`content-${id}`}>
                <Component />
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

function LongComponent() {
  return (
    <div>
      {[...Array(256).keys()].map((_, i) => (
        <p key={i}>{i}</p>
      ))}
    </div>
  )
}
