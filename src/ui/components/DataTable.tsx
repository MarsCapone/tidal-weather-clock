import { addHours, format } from 'date-fns'
import { DataContext } from '@/types/data'

export default function DataTable({
  className,
  dataContext,
}: {
  className?: string
  dataContext: DataContext
}) {
  const highTides = dataContext.tideData
    .filter((t) => t.type === 'high')
    .map((t) => format(addHours(dataContext.referenceDate, t.time), 'p'))
  const lowTides = dataContext.tideData
    .filter((t) => t.type === 'low')
    .map((t) => format(addHours(dataContext.referenceDate, t.time), 'p'))

  const dataTable = [
    { label: 'Wind', values: ['12 kts'] },
    { label: 'Tide Height', values: ['2.10 m'] },
    { label: 'Weather', values: ['sunny'] },
    {
      label: 'Sunrise',
      values: [format(dataContext.sunData.sunRise, 'p')],
    },
    {
      label: 'Sunset',
      values: [format(dataContext.sunData.sunSet, 'p')],
    },
    { label: 'HW', values: highTides },
    { label: 'LW', values: lowTides },
  ]

  const rowSpanByLength = {
    1: 'row-span-1',
    2: 'row-span-2',
  }

  const tableElements = dataTable.flatMap((row, i) => {
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
