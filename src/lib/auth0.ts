import { Auth0Client } from '@auth0/nextjs-auth0/server'
import 'server-only'

export const auth0 = new Auth0Client()
