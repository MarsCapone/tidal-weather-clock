import { ServerActivityFetcher } from '@/lib/utils/activityFetcher'
import { NullCache } from '@/lib/utils/cache'
import { ServerDataFetcher } from '@/lib/utils/fetchData'
import logger from '@/lib/utils/logger'
import { DataContext } from '@/types/context'

export const APP_CONFIG = {
  activityFetcher: new ServerActivityFetcher(),
  clientCache: new NullCache<DataContext>(), // new LocalStorageCache(),
  dataFetchers: [new ServerDataFetcher(logger)],
}
