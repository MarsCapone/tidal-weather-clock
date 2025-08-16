import { auth0 } from '@/lib/auth0'
import { LogInIcon, LogOutIcon } from 'lucide-react'
import React from 'react'

export default async function ProfileMenu() {
  const session = await auth0.getSession()

  if (!session) {
    return (
      <ProfileMenuWrapper buttonContent={<LogInIcon />}>
        <div className={'menu w-full gap-2'}>
          <li className={'menu-item'}>
            <a
              href="/auth/login?screen_hint=signup"
              className={'btn btn-soft rounded-field'}
            >
              <span>Sign up</span>
            </a>
          </li>
          <li className={'menu-item'}>
            <a href="/auth/login" className={'btn btn-soft rounded-field'}>
              <span>Log in</span>
            </a>
          </li>
        </div>
      </ProfileMenuWrapper>
    )
  }
  return (
    <ProfileMenuWrapper
      buttonContent={
        <div className="avatar">
          <div className="w-10 rounded-full">
            <img
              src={session.user.picture}
              alt={`Avatar for ${session.user.name}`}
            />
          </div>
        </div>
      }
    >
      <h4 className="text-xs">Welcome</h4>
      <h1 className="text-md pl-4 font-bold">{session.user.name}</h1>
      <h4 className="pl-4 font-mono text-xs">{session.user.email}</h4>
      <div className="menu w-full gap-2">
        <li className="menu-item">
          <a href="/auth/logout" className="btn btn-soft rounded-field">
            <span>Sign out</span>
            <LogOutIcon className={'w-4'} />
          </a>
        </li>
      </div>
    </ProfileMenuWrapper>
  )
}

function ProfileMenuWrapper({
  buttonContent,
  children,
}: {
  buttonContent: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className={'dropdown dropdown-end dropdown-hover'}>
        <div tabIndex={0}>{buttonContent}</div>
        <div
          tabIndex={0}
          className={
            'dropdown-content bg-base-100 card card-sm z-1 w-72 shadow-sm'
          }
        >
          <div className={'card-body'}>{children}</div>
        </div>
      </div>
    </div>
  )
}
