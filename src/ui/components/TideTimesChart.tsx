import {
  IgrRadialGauge,
  IgrRadialGaugeModule,
  IgrRadialGaugeRange,
} from 'igniteui-react-gauges'
import { TideInfo } from '@/types/data'

IgrRadialGaugeModule.register()

export default function TideTimesChart({
  highTideBounds = 2,
  lowTideBounds = 1,
  tideData,
}: {
  highTideBounds?: number
  lowTideBounds?: number
  tideData: TideInfo[]
}) {
  const highTides = tideData.filter((t) => t.type === 'high')
  const lowTides = tideData.filter((t) => t.type === 'low')

  const highTideTime = highTides.length > 0 ? highTides[0].time : 12
  const lowTideTime = lowTides.length > 0 ? lowTides[0].time : 12

  return (
    <div>
      <div className="aspect-square">
        <IgrRadialGauge
          backingBrush={'#f8fafc'}
          backingOuterExtent={0.8}
          backingShape="circular"
          backingStrokeThickness={0.4}
          font={'18px'}
          fontBrush={'black'}
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
    </div>
  )
}
