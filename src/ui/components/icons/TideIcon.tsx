import { IconBase } from './IconBase'

export default function TideIcon(
  props: React.SVGProps<SVGSVGElement> & { type?: 'high' | 'low' },
) {
  if (props.type === 'low') {
    return <LowTideIcon {...props} />
  }
  return <HighTideIcon {...props} />
}

export function HighTideIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 7c3 -2 6 -2 9 0s6 2 9 0" />
      <path d="M3 17c3 -2 6 -2 9 0s6 2 9 0" />
      <path d="M3 12c3 -2 6 -2 9 0s6 2 9 0" />
    </IconBase>
  )
}

export function LowTideIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 7c.915 -.61 1.83 -1.034 2.746 -1.272m4.212 .22c.68 .247 1.361 .598 2.042 1.052c3 2 6 2 9 0" />
      <path d="M3 17c3 -2 6 -2 9 0c2.092 1.395 4.184 1.817 6.276 1.266" />
      <path d="M3 12c3 -2 6 -2 9 0m5.482 1.429c1.173 -.171 2.345 -.647 3.518 -1.429" />
      <path d="M3 3l18 18" />
    </IconBase>
  )
}

export function TideHeightIcon(props: React.SVGProps<SVGSVGElement>) {
  // https://tablericons.com/icon/ruler-measure-2
  return (
    <IconBase {...props}>
      <path d="M12 19.875c0 .621 -.512 1.125 -1.143 1.125h-5.714a1.134 1.134 0 0 1 -1.143 -1.125v-15.875a1 1 0 0 1 1 -1h5.857c.631 0 1.143 .504 1.143 1.125z" />
      <path d="M12 9h-2" />
      <path d="M12 6h-3" />
      <path d="M12 12h-3" />
      <path d="M12 18h-3" />
      <path d="M12 15h-2" />
      <path d="M21 3h-4" />
      <path d="M19 3v18" />
      <path d="M21 21h-4" />
    </IconBase>
  )
}

export function HighWaterIcon(props: React.SVGProps<SVGSVGElement>) {
  // https://tablericons.com/icon/arrow-bar-to-up
  return (
    <IconBase {...props}>
      <path d="M12 10l0 10" />
      <path d="M12 10l4 4" />
      <path d="M12 10l-4 4" />
      <path d="M4 4l16 0" />
    </IconBase>
  )
}

export function LowWaterIcon(props: React.SVGProps<SVGSVGElement>) {
  // https://tablericons.com/icon/arrow-bar-up
  return (
    <IconBase {...props}>
      <path d="M4 20l16 0" />
      <path d="M12 14l0 -10" />
      <path d="M12 14l4 -4" />
      <path d="M12 14l-4 -4" />
    </IconBase>
  )
}
