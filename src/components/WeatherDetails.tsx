import {
  describeCloudiness,
  describeUvIndex,
  describeWindDirection,
} from '@/components/WeatherStatus'
import { useWorkingHours, WorkingHoursSetting } from '@/hooks/settings'
import {
  DataContext,
  Timestamp,
  WeatherInfo,
  WindInfo,
} from '@/lib/types/context'
import { TimeZoneContext } from '@/lib/utils/contexts'
import {
  utcDateStringToFractionalUtc,
  utcDateStringToLocalTimeString,
} from '@/lib/utils/dates'
import {
  AccessorKeyColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowBigUpIcon } from 'lucide-react'
import React, { useContext, useEffect } from 'react'

export type WeatherDetailsProps = {
  dataContext: DataContext
}

export type AggregatedDataPoint = WindInfo & WeatherInfo

const columnHelper = createColumnHelper<AggregatedDataPoint>()
const DEFAULT_SHOW_OUT_OF_HOURS = false

export function WeatherDetails({ dataContext }: WeatherDetailsProps) {
  const [workingHours] = useWorkingHours()

  return (
    <WeatherDetailsInternal
      aggregatedDataPoints={getAggregatedDatapoints(dataContext)}
      workingHours={workingHours}
    />
  )
}

type WeatherDetailsInternalProps = {
  aggregatedDataPoints: AggregatedDataPoint[]
  workingHours: WorkingHoursSetting
}

export function WeatherDetailsInternal({
  aggregatedDataPoints,
  workingHours,
}: WeatherDetailsInternalProps) {
  const [data, setData] = React.useState(() => [...aggregatedDataPoints])
  const [showOutOfHours, setShowOutOfHours] = React.useState(
    DEFAULT_SHOW_OUT_OF_HOURS,
  )
  const { timeZone } = useContext(TimeZoneContext)
  const columns: AccessorKeyColumnDef<AggregatedDataPoint, any>[] = [
    columnHelper.accessor('timestamp', {
      header: () => <span>Time</span>,
      cell: (info) => {
        const val = info.getValue()
        const fractionalVal = utcDateStringToFractionalUtc(val)
        const timeString = utcDateStringToLocalTimeString(val, { tz: timeZone })
        if (
          fractionalVal >= workingHours.startHour &&
          fractionalVal <= workingHours.endHour
        ) {
          // it's working hours, so show in bold
          return <span className={'font-bold'}>{timeString}</span>
        }
        return <span>{timeString}</span>
      },
      filterFn: (row, columnId, filterValue) => {
        // if filterValue is true, it means showOutOfHours, therefore no filtering
        // or if the working hours are not enabled
        if (filterValue === true || !workingHours.enabled) {
          return true
        }

        if (
          workingHours.startHour === workingHours.endHour &&
          workingHours.startHour === 0
        ) {
          // we're still loading the working hours, so filter out everything
          // this will make it look like the data is loaded from somewhere when the page loads
          return false
        }

        // otherwise we only want to show things that are in-hours

        const val = row.getValue(columnId) as string
        const fractionalVal = utcDateStringToFractionalUtc(val)
        return (
          fractionalVal >= workingHours.startHour &&
          fractionalVal < workingHours.endHour
        )
      },
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
            {describeWindDirection(info.getValue(), true)}
          </div>
        )
      },
    }),
    columnHelper.accessor('speed', {
      header: () => <span>Wind Speed</span>,
      cell: (info) => <div>{info.getValue().toFixed(1)} kts</div>,
    }),
    columnHelper.accessor('gustSpeed', {
      header: () => <span>Gusts</span>,
      cell: (info) => <div>{info.getValue().toFixed(1)} kts</div>,
    }),
    columnHelper.accessor('temperature', {
      header: () => <span>Temperature</span>,
      cell: (info) => `${info.getValue()}ºC`,
    }),
    columnHelper.accessor('cloudCover', {
      header: () => <span>Cloudiness</span>,
      cell: (info) => describeCloudiness(info.getValue()),
    }),
    columnHelper.accessor('uvIndex', {
      header: () => 'UV Index',
      cell: (info) => {
        const val = info.getValue()
        return describeUvIndex(val, true)
      },
    }),
  ]
  const table = useReactTable<AggregatedDataPoint>({
    data,
    columns,
    initialState: {
      columnFilters: [{ id: 'timestamp', value: true }],
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })
  useEffect(() => {
    table.getColumn('timestamp')?.setFilterValue(showOutOfHours)
  }, [table, showOutOfHours, workingHours])

  return (
    <div className="">
      <div className="flex flex-row items-center justify-end gap-2">
        {workingHours.enabled && (
          <label className="label">
            Show
            <input
              data-testid="ooh-toggle"
              className="toggle"
              defaultChecked
              onChange={() => {
                setShowOutOfHours(!showOutOfHours)
                table.getColumn('timestamp')?.setFilterValue(showOutOfHours)
              }}
              type="checkbox"
            />
            Hide Out of Hours
          </label>
        )}
      </div>
      <div className="min-w-full overflow-x-auto">
        <table className="table-pin-rows table">
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
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-testid={`${cell.column.id}-data`}>
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
      </div>
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
