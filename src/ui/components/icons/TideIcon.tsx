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
