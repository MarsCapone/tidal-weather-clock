import logger from '@/app/api/pinoLogger'
import { ProfileMenuInternal } from '@/components/ProfileMenuInternal'
import { auth0, getUserId } from '@/lib/auth0'
import { deleteUser } from '@/lib/db/helpers/users'
import React from 'react'

export default async function ProfileMenu() {
  const session = await auth0.getSession()

  const deleteUserAction = async () => {
    'use server'
    const userId = await getUserId()
    if (userId !== null) {
      await deleteUser(userId)
    } else {
      logger.error('Cannot delete user, no user id found')
    }
  }

  return (
    <ProfileMenuInternal
      session={session}
      deleteUserAction={deleteUserAction}
    />
  )
}
