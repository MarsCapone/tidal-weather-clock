import { DataContext } from '@/lib/types/context'
import { ServerActivityFetcher } from '@/lib/utils/activityFetcher'
import { NullCache } from '@/lib/utils/cache'
import { ServerDataFetcher } from '@/lib/utils/fetchData'
import logger from '@/lib/utils/logger'

export const APP_CONFIG = {
  activityFetcher: new ServerActivityFetcher(),
  clientCache: new NullCache<DataContext>(), // new LocalStorageCache(),
  dataFetchers: [new ServerDataFetcher(logger)],
}
