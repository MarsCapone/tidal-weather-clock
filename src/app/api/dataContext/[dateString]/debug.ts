import logger from '@/app/api/pinoLogger'
import { dateOptions } from '@/lib/utils/dates'
import { del, list, put } from '@vercel/blob'
import { formatISO, isBefore, startOfToday, subDays } from 'date-fns'

export type DebugCategory = 'dataContextSource' | 'dataContext'

export async function uploadDebugData(
  category: DebugCategory,
  name: string,
  data: Record<string, unknown>,
  date?: Date,
): Promise<string> {
  const timestamp = date || new Date()
  const dateFolder = formatISO(timestamp, {
    ...dateOptions,
    representation: 'date',
  })
  const fileName = `${category}/${dateFolder}/${name}${name.endsWith('.json') ? '' : '.json'}`

  const { url } = await put(fileName, JSON.stringify(data), {
    access: 'public',
  })

  logger.debug(`uploaded debug data`, {
    fileName,
    name,
    url,
  })

  return url
}

export async function deleteDebugData(
  ageDays: number,
  category: DebugCategory = 'dataContextSource',
): Promise<void> {
  const cutoffDate = subDays(startOfToday(dateOptions), ageDays)

  const blobs = await list({
    prefix: `${category}/`,
  })

  const blobsToDelete = blobs.blobs.filter((blob) => {
    const blobDate = new Date(blob.pathname.split('/')[1])
    return isBefore(cutoffDate, blobDate)
  })

  if (blobsToDelete.length === 0) {
    logger.info('no debug data to delete', { ageDays, category })
    return
  }

  logger.info(`deleting debug data blobs`, {
    ageDays,
    blobs: blobsToDelete.map((blob) => blob.pathname),
    category,
    count: blobsToDelete.length,
  })
  await Promise.all(
    blobsToDelete.map((blob) => {
      return del(blob.pathname)
    }),
  )
}
