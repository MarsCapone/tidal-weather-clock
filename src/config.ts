import { DataContext } from '@/types/context'
import { ServerActivityFetcher } from '@/utils/activityFetcher'
import { NullCache } from '@/utils/cache'
import { ServerDataFetcher } from '@/utils/fetchData'
import logger from '@/utils/logger'

export const APP_CONFIG = {
  activityFetcher: new ServerActivityFetcher(),
  clientCache: new NullCache<DataContext>(), // new LocalStorageCache(),
  dataFetchers: [new ServerDataFetcher(logger)],
}
