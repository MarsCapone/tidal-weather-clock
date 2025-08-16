import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { secondsInDay } from 'date-fns/constants'

export const auth0 = new Auth0Client({
  session: {
    rolling: true,
    // every 30 days you have to login again
    absoluteDuration: secondsInDay * 30,
    // if you don't access for more than 7 days, you get logged out
    inactivityDuration: secondsInDay * 7,
  },
})
