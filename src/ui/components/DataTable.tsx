import { DataContext } from '@/types/data'
import { formatTime, withFractionalTime } from '@/utils/dates'
import { calcMean } from '@/utils/utils'

export default function DataTable({
  className,
  dataContext,
}: {
  className?: string
  dataContext: DataContext
}) {
  const tides = dataContext.tideData.map((t) => ({
    ...t,
    display: formatTime(withFractionalTime(dataContext.referenceDate, t.time)),
  }))

  const highTides = tides.filter((t) => t.type === 'high')
  const lowTides = tides.filter((t) => t.type === 'low')

  const windSpeeds = dataContext.windData.points.map((p) => p.speed)
  const cloudiness = dataContext.weatherData.points.map((p) => p.cloudCover)
  const temperature = dataContext.weatherData.points.map((p) => p.temperature)

  const dataTable = [
    {
      label: 'Wind',
      values: [
        windSpeeds.length > 0
          ? `${calcMean(windSpeeds).toFixed(2)} kts`
          : undefined,
      ],
    },
    {
      label: 'Temperature',
      values: [
        temperature.length > 0
          ? `${calcMean(temperature).toFixed(2)}°C`
          : undefined,
      ],
    },
    {
      label: 'Cloudiness',
      values: [
        cloudiness.length > 0
          ? `${calcMean(cloudiness).toFixed(2)}%`
          : undefined,
      ],
    },
    {
      label: 'Sunrise',
      values: [
        dataContext.sunData.sunRise
          ? formatTime(dataContext.sunData.sunRise)
          : undefined,
      ],
    },
    {
      label: 'Sunset',
      values: [
        dataContext.sunData.sunSet
          ? formatTime(dataContext.sunData.sunSet)
          : undefined,
      ],
    },
    { label: 'HW', values: highTides.map((t) => t.display) },
    { label: 'LW', values: lowTides.map((t) => t.display) },
    {
      label: 'Tide Heights',
      values: [...tides.map((t) => `${t.height.toFixed(1)}m`)],
    },
  ]

  const rowSpanByLength = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
  }

  const tableElements = dataTable.flatMap((row, i) => {
    if (row.values.every((v) => v === undefined)) {
      return [
        <div
          className={`text-end ${rowSpanByLength[row.values.length as 1 | 2]}`}
          key={`${row.label}-label-${i}`}
        >
          {row.label}
        </div>,
        <div key={`${row.label}-value-${i}`} className="text-error text-start">
          NO DATA
        </div>,
      ]
    }

    return [
      <div
        className={`text-end ${rowSpanByLength[row.values.length as 1 | 2]}`}
        key={`${row.label}-label-${i}`}
      >
        {row.label}
      </div>,
      ...row.values.map((value, v) => (
        <div className="text-start" key={`${row.label}-value-${i}-${v}`}>
          {value}
        </div>
      )),
    ]
  })

  return (
    <div
      className={`grid grid-cols-2 gap-x-16 gap-y-2 md:gap-x-6 ${className || ''}`}
    >
      {...tableElements}
    </div>
  )
}
