import React from 'react'

export type TimeRange = {
  id: string
  startHour: number
  endHour: number
  color: keyof typeof colorClasses
  label: string
}

export type TimePointer = {
  id: string
  hour: number
  color: keyof typeof colorClasses
  label: string
  isOutside: boolean
}

const colorClasses = {
  primary: {
    fill: 'fill-primary',
    stroke: 'stroke-primary',
    text: 'text-primary',
    bg: 'bg-primary',
  },
  success: {
    fill: 'fill-success',
    stroke: 'stroke-success',
    text: 'text-success',
    bg: 'bg-success',
  },
  warning: {
    fill: 'fill-warning',
    stroke: 'stroke-warning',
    text: 'text-warning',
    bg: 'bg-warning',
  },
  error: {
    fill: 'fill-error',
    stroke: 'stroke-error',
    text: 'text-error',
    bg: 'bg-error',
  },
}

type ClockChartOptions = {
  range: {
    width?: number
    offset?: number
  }
}

export type ClockChartProps = {
  timeRanges: TimeRange[]
  timePointers: TimePointer[]
  showCenterDot?: boolean
  size?: number
  clockRadius?: number
  options?: ClockChartOptions
}

export default function ClockChart({
  timeRanges,
  timePointers,
  showCenterDot = true,
  size = 400,
  clockRadius = 150,
  options = { range: { width: 20, offset: -10 } },
}: ClockChartProps) {
  const centerX = size / 2
  const centerY = size / 2

  // Generate hour markers
  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const hour = i === 0 ? 12 : i
    const angle = i * 30 - 90 // Start from 12 o'clock position
    const radian = (angle * Math.PI) / 180

    const x1 = centerX + (clockRadius - 20) * Math.cos(radian)
    const y1 = centerY + (clockRadius - 20) * Math.sin(radian)
    const x2 = centerX + (clockRadius - 5) * Math.cos(radian)
    const y2 = centerY + (clockRadius - 5) * Math.sin(radian)
    const textX = centerX + (clockRadius - 35) * Math.cos(radian)
    const textY = centerY + (clockRadius - 35) * Math.sin(radian)

    return (
      <g key={`hour-${i}`}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="stroke-base-content"
          strokeWidth="2"
        />
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl font-bold stroke-base-content fill-base-content"
        >
          {hour}
        </text>
      </g>
    )
  })

  function getPlusMinusPoint(
    center: [number, number],
    radius: number,
    radian: number,
    offset: number = 0,
  ): [number, number, number, number] {
    const [centerX, centerY] = center
    const minusX = centerX + radius * Math.cos(radian - offset)
    const plusX = centerX + radius * Math.cos(radian + offset)
    const minusY = centerY + radius * Math.sin(radian - offset)
    const plusY = centerY + radius * Math.sin(radian + offset)
    return [minusX, minusY, plusX, plusY]
  }

  // Generate triangular pointers
  const triangularPointers = timePointers.map((pointer) => {
    const totalMinutes = (pointer.hour % 12) * 60
    const angle = (totalMinutes / 720) * 360 - 90 // Convert to degrees from 12 o'clock
    const radian = (angle * Math.PI) / 180

    // Swap the tip and base positions
    const tipRadius = pointer.isOutside ? clockRadius + 2 : clockRadius - 22
    const baseRadius = pointer.isOutside ? clockRadius + 10 : clockRadius - 30

    const [tipX, tipY] = getPlusMinusPoint(
      [centerX, centerY],
      tipRadius,
      radian,
    )
    const [base1X, base1Y, base2X, base2Y] = getPlusMinusPoint(
      [centerX, centerY],
      baseRadius,
      radian,
      0.03,
    )

    const pathData = `M ${tipX} ${tipY} L ${base1X} ${base1Y} L ${base2X} ${base2Y} Z`

    const labelRadius = pointer.isOutside ? clockRadius + 15 : clockRadius - 32
    const [labelX, labelY] = getPlusMinusPoint(
      [centerX, centerY],
      labelRadius,
      radian,
    )

    const textAnchor = pointer.isOutside
      ? pointer.hour % 12 < 6
        ? 'start'
        : 'end'
      : pointer.hour % 12 < 6
        ? 'end'
        : 'start'

    return (
      <g key={pointer.id}>
        <path
          d={pathData}
          className={`${colorClasses[pointer.color].fill} ${colorClasses[pointer.color].stroke}`}
          strokeWidth={1}
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor={textAnchor}
          dominantBaseline="central"
          className="text-xs font-medium fill-base-content stroke-base-content"
        >
          {pointer.label}
        </text>
      </g>
    )
  })

  // Generate time range arcs
  const timeRangeArcs = timeRanges
    .map((range) => {
      // ensure the startHour and endHour are within 0-12 range
      // Normalize hours to 0-12 range
      if (range.startHour < 12 && range.endHour > 12) {
        // If the range crosses noon, adjust the hours
        return [
          {
            ...range,
            startHour: range.startHour,
            endHour: 11.99999, // we can't actually use 12, so we use a value just below it
          },
          {
            ...range,
            id: `${range.id}-pm`,
            startHour: 0,
            endHour: range.endHour - 12,
          },
        ]
      }
      return [range]
    })
    .flat()
    .map((range) => {
      const startAngle = (range.startHour % 12) * 30 - 90
      const endAngle = (range.endHour % 12) * 30 - 90

      const startRadian = (startAngle * Math.PI) / 180
      const endRadian = (endAngle * Math.PI) / 180

      const outerRadius =
        clockRadius +
        (options.range.width ?? 6) / 2 +
        (options.range.offset ?? 0)
      const innerRadius =
        clockRadius -
        (options.range.width ?? 6) / 2 +
        (options.range.offset ?? 0)

      const x1Outer = centerX + outerRadius * Math.cos(startRadian)
      const y1Outer = centerY + outerRadius * Math.sin(startRadian)
      const x2Outer = centerX + outerRadius * Math.cos(endRadian)
      const y2Outer = centerY + outerRadius * Math.sin(endRadian)

      const x1Inner = centerX + innerRadius * Math.cos(startRadian)
      const y1Inner = centerY + innerRadius * Math.sin(startRadian)
      const x2Inner = centerX + innerRadius * Math.cos(endRadian)
      const y2Inner = centerY + innerRadius * Math.sin(endRadian)

      const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0

      const pathData = [
        `M ${x1Inner} ${y1Inner}`,
        `L ${x1Outer} ${y1Outer}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
        `L ${x2Inner} ${y2Inner}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
        'Z',
      ].join(' ')

      return (
        <path
          key={range.id}
          d={pathData}
          className={`${colorClasses[range.color].fill} ${colorClasses[range.color].stroke}`}
          fillOpacity={0.8}
          strokeWidth={1}
        />
      )
    })

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Clock face background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={clockRadius}
          className="fill-base-100 stroke-base-content"
          strokeWidth="3"
        />

        {/* Time range arcs */}
        {timeRangeArcs}

        {/* Triangular pointers */}
        {triangularPointers}

        {/* Hour markers and numbers */}
        {hourMarkers}

        {/* Center dot */}
        {showCenterDot && (
          <circle
            cx={centerX}
            cy={centerY}
            r="6"
            className="fill-base-content"
          />
        )}
      </svg>
    </div>
  )
}
