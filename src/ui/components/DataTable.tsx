import { format } from 'date-fns'
import { DataContext } from '@/types/data'

export default function DataTable(props: {
  dataContext: DataContext
  className?: string
}) {
  const highTides = props.dataContext
    .tideData!.points.filter((t) => t.type === 'high')
    .map((t) => format(t.timestamp, 'p'))
  const lowTides = props.dataContext
    .tideData!.points.filter((t) => t.type === 'low')
    .map((t) => format(t.timestamp, 'p'))

  const dataTable = [
    { label: 'Wind', values: ['12 kts'] },
    { label: 'Tide Height', values: ['2.10 m'] },
    { label: 'Weather', values: ['sunny'] },
    {
      label: 'Sunrise',
      values: [format(props.dataContext.sunData!.sunRise, 'p')],
    },
    {
      label: 'Sunset',
      values: [format(props.dataContext.sunData!.sunSet, 'p')],
    },
    { label: 'HW', values: highTides },
    { label: 'LW', values: lowTides },
  ]

  const rowSpanByLength = {
    1: 'row-span-1',
    2: 'row-span-2',
  }

  const tableElements = dataTable
    .map((row, i) => {
      return [
        <div
          key={`${row.label}-label-${i}`}
          className={`text-end ${rowSpanByLength[row.values.length as 1 | 2]}`}
        >
          {row.label}
        </div>,
        ...row.values.map((value, v) => (
          <div key={`${row.label}-value-${i}-${v}`} className="text-start">
            {value}
          </div>
        )),
      ]
    })
    .flat()

  return (
    <div
      className={`grid grid-cols-2 gap-x-16 gap-y-2 md:gap-x-6 ${props.className || ''}`}
    >
      {...tableElements}
    </div>
  )
}
