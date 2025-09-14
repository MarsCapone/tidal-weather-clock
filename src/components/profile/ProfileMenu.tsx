import { ProfileMenuInternal } from '@/components/profile/ProfileMenuInternal'
import { auth0 } from '@/lib/auth0'
import React from 'react'

export default async function ProfileMenu() {
  const session = await auth0.getSession()

  return <ProfileMenuInternal session={session} />
}
