import {
  IgrRadialGauge,
  IgrRadialGaugeModule,
  IgrRadialGaugeRange,
} from 'igniteui-react-gauges'
import { TideDataPoints } from '@/types/data'

IgrRadialGaugeModule.register()

function getFractionalHours(d: Date | null): number | undefined {
  if (!d) {
    return undefined
  }
  const hours = d.getHours()
  const fractionalMinutes = d.getMinutes() / 60
  return hours + fractionalMinutes
}

export default function TideTimesChart({
  highTideBounds = 2,
  lowTideBounds = 1,
  tideData,
}: {
  highTideBounds?: number
  lowTideBounds?: number
  tideData: TideDataPoints
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
          backingBrush={'#f8fafc'}
          backingOuterExtent={0.8}
          backingShape="circular"
          backingStrokeThickness={0.4}
          font={'18px'}
          fontBrush={isDark ? 'white' : 'black'}
          height="100%"
          highlightValue={lowTideTime}
          highlightValueOpacity={1}
          interval={1}
          isNeedleDraggingEnabled={false}
          labelExtent={0.65}
          maximumValue={12}
          minimumValue={1}
          minorTickCount={0}
          needlePivotShape={'none'}
          needleStartWidthRatio={0.05}
          rangeBrushes={['red', 'green', 'white']}
          rangeOutlines={'#000'}
          scaleEndAngle={270}
          scaleEndExtent={0.5}
          scaleOversweep={30}
          scaleStartAngle={-60}
          scaleStartExtent={0.3}
          tickStrokeThickness={1.5}
          value={highTideTime}
          width="100%"
        >
          {highTideTime !== undefined && (
            <IgrRadialGaugeRange
              brush="green"
              endValue={highTideTime + highTideBounds}
              key={'high-tide'}
              startValue={highTideTime - highTideBounds}
            />
          )}
          {lowTideTime !== undefined && (
            <IgrRadialGaugeRange
              brush="red"
              endValue={lowTideTime + lowTideBounds}
              key={'low-tide'}
              startValue={lowTideTime - lowTideBounds}
            />
          )}
        </IgrRadialGauge>
      </div>
      {/*<div className="grid grid-cols-2 gap-2">*/}
      {/*  {highTides && (*/}
      {/*    <>*/}
      {/*      <div className={rowSpanClass[highTides.length as 1 | 2]}>HW</div>*/}
      {/*      {highTides.map((d, i) => (*/}
      {/*        <div key={`high-tide-${i}`}>{format(d, 'p')}</div>*/}
      {/*      ))}*/}
      {/*    </>*/}
      {/*  )}*/}
      {/*  {lowTides && (*/}
      {/*    <>*/}
      {/*      <div className={rowSpanClass[lowTides.length as 1 | 2]}>LW</div>*/}
      {/*      {lowTides.map((d, i) => (*/}
      {/*        <div key={`low-tide-${i}`}>{format(d, 'p')}</div>*/}
      {/*      ))}*/}
      {/*    </>*/}
      {/*  )}*/}
      {/*</div>*/}
    </div>
  )
}
