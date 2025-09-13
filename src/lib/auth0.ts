import { db } from '@/lib/db'
import { createUserWithExtras, getUserIdByEmail } from '@/lib/db/helpers/users'
import logger from '@/lib/utils/logger'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { blake3 } from '@noble/hashes/blake3'
import { bytesToHex } from '@noble/hashes/utils'
import { secondsInDay } from 'date-fns/constants'
import { eq } from 'drizzle-orm'
import { usersTable } from './db/schemas/users'

export const auth0 = new Auth0Client({
  session: {
    rolling: true,
    // every 30 days you have to login again
    absoluteDuration: secondsInDay * 30,
    // if you don't access for more than 7 days, you get logged out
    inactivityDuration: secondsInDay * 7,
  },
})

export const getUserId = async () => {
  const session = await auth0.getSession()

  if (session === null) {
    return null
  }

  const email = session.user.email
  if (email === undefined) {
    throw new Error('Unable to get user')
  }

  const userId = await getUserIdByEmail(email)
  if (userId !== null) {
    return userId
  }

  logger.info('creating user', {
    emailHash: bytesToHex(blake3(new TextEncoder().encode(email))),
  })
  return await createUserWithExtras(email)
}
