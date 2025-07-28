import React, { useEffect, useState } from 'react'

export type TimeRange = {
  color: keyof typeof colorClasses
  endHour: number
  id: string
  label: string
  startHour: number
}

export type TimePointer = {
  color: keyof typeof colorClasses
  hour: number
  id: string
  isOutside: boolean
  label: string
}

const colorClasses = {
  // core
  error: {
    bg: 'bg-error',
    fill: 'fill-error',
    stroke: 'stroke-error',
    text: 'text-error',
  },
  primary: {
    bg: 'bg-primary',
    fill: 'fill-primary',
    stroke: 'stroke-primary',
    text: 'text-primary',
  },
  success: {
    bg: 'bg-success',
    fill: 'fill-success',
    stroke: 'stroke-success',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning',
    fill: 'fill-warning',
    stroke: 'stroke-warning',
    text: 'text-warning',
  },
  // shades
  success10: {
    bg: 'bg-success/10',
    fill: 'fill-success/10',
    stroke: 'stroke-success/10',
    text: 'text-success/10',
  },
  success20: {
    bg: 'bg-success/20',
    fill: 'fill-success/20',
    stroke: 'stroke-success/20',
    text: 'text-success/20',
  },
  success30: {
    bg: 'bg-success/30',
    fill: 'fill-success/30',
    stroke: 'stroke-success/30',
    text: 'text-success/30',
  },
  success40: {
    bg: 'bg-success/40',
    fill: 'fill-success/40',
    stroke: 'stroke-success/40',
    text: 'text-success/40',
  },
  success50: {
    bg: 'bg-success/50',
    fill: 'fill-success/50',
    stroke: 'stroke-success/50',
    text: 'text-success/50',
  },
  success60: {
    bg: 'bg-success/60',
    fill: 'fill-success/60',
    stroke: 'stroke-success/60',
    text: 'text-success/60',
  },
  success70: {
    bg: 'bg-success/70',
    fill: 'fill-success/70',
    stroke: 'stroke-success/70',
    text: 'text-success/70',
  },
  success80: {
    bg: 'bg-success/80',
    fill: 'fill-success/80',
    stroke: 'stroke-success/80',
    text: 'text-success/80',
  },
  success90: {
    bg: 'bg-success/90',
    fill: 'fill-success/90',
    stroke: 'stroke-success/90',
    text: 'text-success/90',
  },
}

type ClockChartOptions = {
  range: {
    offset?: number
    width?: number
  }
}

export type ClockChartProps = {
  clockRadius?: number
  options?: ClockChartOptions
  showCenterDot?: boolean
  showClockHands?: boolean
  size?: number
  timePointers: TimePointer[]
  timeRanges: TimeRange[]
}

export default function ClockChart({
  clockRadius = 150,
  options = { range: { offset: -10, width: 20 } },
  showCenterDot = true,
  showClockHands = true,
  size = 400,
  timePointers,
  timeRanges,
}: ClockChartProps) {
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)

  useEffect(() => {
    if (!showClockHands) {
      return () => null
    }
    const updateTime = () => {
      const current = new Date()
      setHours(current.getHours())
      setMinutes(current.getMinutes())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [showClockHands])

  const centerX = size / 2
  const centerY = size / 2
  const center: [number, number] = [centerX, centerY]

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
          className="stroke-base-content"
          strokeWidth="2"
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
        />
        <text
          className="stroke-base-content fill-base-content text-2xl font-bold"
          dominantBaseline="central"
          textAnchor="middle"
          x={textX}
          y={textY}
        >
          {hour}
        </text>
      </g>
    )
  })

  // Generate triangular pointers
  const triangularPointers = timePointers.map((pointer) => {
    const totalMinutes = (pointer.hour % 12) * 60
    const angle = (totalMinutes / 720) * 360 - 90 // Convert to degrees from 12 o'clock
    const radian = (angle * Math.PI) / 180

    const [outsideTip, insideTip] = [2, 50]

    // Swap the tip and base positions
    const tipRadius = pointer.isOutside
      ? clockRadius + outsideTip
      : clockRadius - insideTip
    const baseRadius = pointer.isOutside
      ? clockRadius + (outsideTip + 8)
      : clockRadius - (insideTip + 8)

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

    const labelRadius = pointer.isOutside
      ? clockRadius + (outsideTip + 15)
      : clockRadius - (insideTip + 15)
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
          className={`${colorClasses[pointer.color].fill} ${colorClasses[pointer.color].stroke}`}
          d={pathData}
          strokeWidth={1}
        />
        <text
          className="fill-base-content stroke-base-content text-xs font-medium"
          dominantBaseline="central"
          textAnchor={textAnchor}
          x={labelX}
          y={labelY}
        >
          {pointer.label}
        </text>
      </g>
    )
  })

  // Generate time range arcs
  const timeRangeArcs = timeRanges
    .flatMap((range) => {
      // ensure the startHour and endHour are within 0-12 range
      // Normalize hours to 0-12 range
      if (range.startHour < 12 && range.endHour >= 12) {
        // If the range crosses noon, adjust the hours
        return [
          {
            ...range,
            endHour: 11.999_99, // we can't actually use 12, so we use a value just below it
            startHour: range.startHour,
          },
          {
            ...range,
            endHour: range.endHour - 12,
            id: `${range.id}-pm`,
            startHour: 0,
          },
        ]
      }
      return [range]
    })
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

      const [x1Outer, y1Outer] = getPlusMinusPoint(
        center,
        outerRadius,
        startRadian,
      )
      const [x2Outer, y2Outer] = getPlusMinusPoint(
        center,
        outerRadius,
        endRadian,
      )

      const [x1Inner, y1Inner] = getPlusMinusPoint(
        center,
        innerRadius,
        startRadian,
      )
      const [x2Inner, y2Inner] = getPlusMinusPoint(
        center,
        innerRadius,
        endRadian,
      )

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
          className={`${colorClasses[range.color].fill} ${colorClasses[range.color].stroke}`}
          d={pathData}
          fillOpacity={0.8}
          key={range.id}
          strokeWidth={1}
        />
      )
    })

  // Generate hour markers
  const clockHands = (hour: number, minute: number) => {
    return [
      { frac: (minute / 60) * 12, len: 0.8, stroke: 6 }, // minute hand
      { frac: (hour % 12) + minute / 60, len: 0.7, stroke: 7 }, // hour hand
    ].map(({ frac, len, stroke }, i) => {
      const angle = frac * 30 - 90 // Start from 12 o'clock position
      const radian = (angle * Math.PI) / 180

      const [x1, y1] = getPlusMinusPoint(
        [centerX, centerY],
        clockRadius * len,
        radian,
      )

      return (
        <g key={`hand-${i}`}>
          <line
            className="stroke-base-content"
            radius={100}
            strokeWidth={stroke}
            x1={centerX}
            x2={x1}
            y1={centerY}
            y2={y1}
          />
        </g>
      )
    })
  }

  return (
    <div className="flex justify-center">
      <svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        {/* Clock face background */}
        <circle
          className="fill-base-100 stroke-base-content"
          cx={centerX}
          cy={centerY}
          r={clockRadius}
          strokeWidth="3"
        />

        {/* Time range arcs */}
        {timeRangeArcs}

        {/* Triangular pointers */}
        {triangularPointers}

        {/* Hour markers and numbers */}
        {hourMarkers}

        {/* Clock hands for time */}
        {showClockHands && clockHands(hours, minutes)}

        {/* Center dot */}
        {showCenterDot && (
          <circle
            className="fill-base-content"
            cx={centerX}
            cy={centerY}
            r="3"
          />
        )}
      </svg>
    </div>
  )
}

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
