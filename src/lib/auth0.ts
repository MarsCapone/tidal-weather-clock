import logger from '@/app/api/pinoLogger'
import {
  createUserWithExtras,
  getUserIdByEmail,
  updateLastLogin,
} from '@/lib/db/helpers/users'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { SessionData } from '@auth0/nextjs-auth0/types'
import { formatISO } from 'date-fns'
import { secondsInDay } from 'date-fns/constants'

async function modifySession(session: SessionData): Promise<SessionData> {
  const email = session.user.email
  let userId = email === undefined ? null : await getUserIdByEmail(email)

  // if we're here and there's email but not a user, then we need to create a user
  if (email !== undefined && userId === null) {
    userId = await createUserWithExtras(email)
  }

  let lastLogin = null
  if (userId !== null) {
    lastLogin = await updateLastLogin(userId)
  }

  return {
    ...session,
    user: {
      ...session.user,
      twcUserId: userId,
      twcLastLogin: lastLogin ? formatISO(lastLogin) : null,
    },
  }
}

export const auth0 = new Auth0Client({
  session: {
    rolling: true,
    // every 30 days you have to login again
    absoluteDuration: secondsInDay * 30,
    // if you don't access for more than 7 days, you get logged out
    inactivityDuration: secondsInDay * 7,
  },
  async beforeSessionSaved(session) {
    return await modifySession(session)
  },
})

export const getUserId = async (): Promise<string | null> => {
  const session = await auth0.getSession()

  if (session === null) {
    return null
  }

  if (session.user.twcUserId) {
    return session.user.twcUserId
  }

  const email = session.user.email
  if (email === undefined) {
    logger.error('Unable to get user', { user: session.user })
    return null
  }

  const userId = await getUserIdByEmail(email)
  if (userId !== null) {
    return userId
  }

  return null
}
