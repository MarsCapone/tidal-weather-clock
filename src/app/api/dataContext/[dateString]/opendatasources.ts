import { DataContext } from '@/types/context'
import { IDataContextFetcher, ILogger } from '@/types/interfaces'

type EasyTideData = {
  footerNote?: string
  lunarPhaseList?: {
    dateTime: string
    lunarPhaseType: number
  }[]
  tidalEventList: {
    date: string
    dateTime: string
    eventType: 0 | 1 // 0 - high tide, 1 - low tide
    height: number
    isApproximate?: boolean | null
    isApproximateHeight?: boolean | null
  }[]
  tidalHeightOccurrenceList?: {
    dateTime: string
    height: number
  }[]
}

export class OpenMeteoAndEasyTideDataFetcher implements IDataContextFetcher {
  private logger: ILogger

  constructor(logger: ILogger) {
    this.logger = logger
  }

  isCacheable(): boolean {
    return true
  }

  async getEasyTideData(stationId: string): Promise<EasyTideData | null> {
    const response = await fetch(
      `https://easytide.admiralty.co.uk/Home/GetPredictionData?stationId=${stationId}`,
    )
    if (!response.ok) {
      this.logger.error('Failed to fetch EasyTide data', {
        status: response.status,
        statusText: response.statusText,
      })
      return null
    }

    const content = await response.json()
    if (!content || !content.tidalEventList) {
      this.logger.warn('Invalid EasyTide data received', { content })
      return null
    }

    return content as EasyTideData
  }

  async getDataContext(date: Date): Promise<DataContext | null> {
    return null
  }

  async getDataContexts(date: Date): Promise<DataContext[]> {
    return []
  }
}
