import { auth0 } from '@/lib/auth0'
import { SessionData } from '@auth0/nextjs-auth0/types'
import { LogInIcon, LogOutIcon, LucideProps } from 'lucide-react'
import React, { ForwardRefExoticComponent, RefAttributes } from 'react'

export default async function ProfileMenu() {
  const session = await auth0.getSession()

  if (!session) {
    return (
      <ProfileMenuWrapper Icon={LogInIcon}>
        <a href="/auth/login?screen_hint=signup">
          <button>Sign up</button>
        </a>
        <a href="/auth/login">
          <button>Log in</button>
        </a>
      </ProfileMenuWrapper>
    )
  }
  return (
    <ProfileMenuWrapper Icon={LogOutIcon}>
      <h1>Welcome, {session.user.name}!</h1>
      <p>
        <a href="/auth/logout">
          <button>Log out</button>
        </a>
      </p>
    </ProfileMenuWrapper>
  )
}

function ProfileMenuWrapper({
  Icon,
  children,
}: {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  children: React.ReactNode
}) {
  return (
    <div>
      <div className={'dropdown dropdown-end'}>
        <div
          tabIndex={0}
          role={'button'}
          className={'btn btn-ghost rounded-field'}
        >
          <Icon />
        </div>
        <div
          tabIndex={0}
          className={'dropdown-content bg-base-100 card card-sm z-1 shadow-sm'}
        >
          <div className={'card-body'}>{children}</div>
        </div>
      </div>
    </div>
  )
}

function LoginMenu() {}

function LogoutMenu({ session }: { session: SessionData }) {}
