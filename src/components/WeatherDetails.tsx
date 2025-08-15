import { describeCloudiness } from '@/components/WeatherStatus'
import { DataContext, Timestamp, WeatherInfo, WindInfo } from '@/types/context'
import { utcDateStringToLocalTimeString } from '@/utils/dates'
import {
  AccessorKeyColumnDef,
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowBigUpIcon } from 'lucide-react'
import React from 'react'

export type WeatherDetailsProps = {
  dataContext: DataContext
}

type AggregatedDataPoint = WindInfo & WeatherInfo

const columnHelper = createColumnHelper<AggregatedDataPoint>()

const columns: AccessorKeyColumnDef<AggregatedDataPoint, any>[] = [
  columnHelper.accessor('timestamp', {
    header: () => <span>Time</span>,
    cell: (info) => utcDateStringToLocalTimeString(info.getValue()),
  }),
  columnHelper.accessor('direction', {
    header: () => '',
    cell: (info) => {
      return (
        <div className="flex flex-row items-center gap-2">
          <ArrowBigUpIcon
            className={`fill-accent h-4 w-4`}
            style={{ rotate: `${info.getValue() + 180}deg` }}
          />
          {info.getValue()}º
        </div>
      )
    },
  }),
  columnHelper.accessor('speed', {
    header: () => <span>Wind Speed</span>,
  }),
  columnHelper.accessor('gustSpeed', {
    header: () => <span>Gusts</span>,
  }),
  columnHelper.accessor('cloudCover', {
    header: () => <span>Cloudiness</span>,
    cell: (info) => describeCloudiness(info.getValue()),
  }),
  columnHelper.accessor('sunshineDuration', {
    header: () => <span>Sunshine %</span>,
    cell: (info) => {
      const v = info.getValue()
      if (v) {
        return (v * 100) / 3600
      }
      return null
    },
  }),
]

export function WeatherDetails({ dataContext }: WeatherDetailsProps) {
  const [data, setData] = React.useState(() => [
    ...getAggregatedDatapoints(dataContext),
  ])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="h-4" />
    </div>
  )
}

function byTimestamp<T extends Timestamp>(points: T[]): Record<string, T> {
  return Object.fromEntries(points.map((p) => [p.timestamp, p]))
}

function getAggregatedDatapoints(
  dataContext: DataContext,
): AggregatedDataPoint[] {
  const timestamps = dataContext.weatherData.points.map(
    (point) => point.timestamp,
  )

  const weatherByTimestamp = byTimestamp<WeatherInfo>(
    dataContext.weatherData.points,
  )
  const windByTimestamp = byTimestamp<WindInfo>(dataContext.windData.points)

  return timestamps.map((t) => ({
    ...(weatherByTimestamp[t] || {}),
    ...(windByTimestamp[t] || {}),
  }))
}
