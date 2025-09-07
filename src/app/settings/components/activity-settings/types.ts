import { Activity } from '@/lib/types/activity'
import * as z from 'zod'

export const InputActivities = z.object({
  activities: z.array(Activity),
})

export type TInputActivities = z.infer<typeof InputActivities>
