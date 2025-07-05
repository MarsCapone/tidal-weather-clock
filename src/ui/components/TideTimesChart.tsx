import {
  IgrRadialGauge,
  IgrRadialGaugeModule,
  IgrRadialGaugeRange,
} from 'igniteui-react-gauges'
import { SunDataPoints, TideDataPoints } from '@/types/data'
import { format } from 'date-fns'
import { useState } from 'react'

IgrRadialGaugeModule.register()

function getFractionalHours(d: Date | null): number | undefined {
  if (!d) return undefined
  const hours = d.getHours()
  const fractionalMinutes = d.getMinutes() / 60
  return hours + fractionalMinutes
}

export default function TideTimesChart({
  tideData,
  highTideBounds = 2,
  lowTideBounds = 1,
}: {
  tideData: TideDataPoints
  highTideBounds?: number
  lowTideBounds?: number
}) {
  const isDark = document.documentElement.classList.contains('dark')

  const highTides = tideData.points
    .filter((t) => t.type === 'high')
    .map((t) => t.timestamp)
  const lowTides = tideData.points
    .filter((t) => t.type === 'low')
    .map((t) => t.timestamp)

  const highTideTime = highTides ? getFractionalHours(highTides[0]) : undefined
  const lowTideTime = lowTides ? getFractionalHours(lowTides[0]) : undefined

  const rowSpanClass = {
    1: 'row-span-1',
    2: 'row-span-2',
  }

  return (
    <div>
      <div className="aspect-square">
        <IgrRadialGauge
          value={highTideTime}
          highlightValue={lowTideTime}
          backingShape="circular"
          backingOuterExtent={0.8}
          backingStrokeThickness={0.4}
          width="100%"
          height="100%"
          scaleStartAngle={-60}
          scaleEndAngle={270}
          scaleOversweep={30}
          scaleStartExtent={0.3}
          scaleEndExtent={0.5}
          interval={1}
          minimumValue={1}
          maximumValue={12}
          minorTickCount={0}
          tickStrokeThickness={1.5}
          labelExtent={0.65}
          isNeedleDraggingEnabled={false}
          highlightValueOpacity={1}
          needleStartWidthRatio={0.05}
          needlePivotShape={'none'}
          fontBrush={isDark ? 'white' : 'black'}
          backingBrush={'white'}
          font={'18px'}
          rangeBrushes={['red', 'green', 'white']}
          rangeOutlines={'#000'}
        >
          {highTideTime !== undefined && (
            <IgrRadialGaugeRange
              key={'high-tide'}
              startValue={highTideTime - highTideBounds}
              endValue={highTideTime + highTideBounds}
              brush="green"
            />
          )}
          {lowTideTime !== undefined && (
            <IgrRadialGaugeRange
              key={'low-tide'}
              startValue={lowTideTime - lowTideBounds}
              endValue={lowTideTime + lowTideBounds}
              brush="red"
            />
          )}
        </IgrRadialGauge>
      </div>
      <div className="grid grid-cols-2 grid-rows-4 gap-4">
        {highTides && (
          <>
            <div className={rowSpanClass[highTides.length as 1 | 2]}>HW</div>
            {highTides.map((d) => (
              <div>{format(d, 'p')}</div>
            ))}
          </>
        )}
        {lowTides && (
          <>
            <div className={rowSpanClass[lowTides.length as 1 | 2]}>LW</div>
            {lowTides.map((d) => (
              <div>{format(d, 'p')}</div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
