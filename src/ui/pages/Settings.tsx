import { Link } from 'react-router'
import React from 'react'

export default function Settings() {
  return (
    <div>
      <p className="link text-xl mb-4">
        <Link to={'/settings/internal'}>Internal Settings</Link>
      </p>
      <p className="link text-xl mb-4">
        <Link to={'/settings/activities'}>Activity Settings</Link>
      </p>
    </div>
  )
}
