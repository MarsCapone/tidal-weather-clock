import { IconBase } from './IconBase'

export default function WindStateIcon(
  props: React.SVGProps<SVGSVGElement> & { type?: 'wind' | 'no-wind' },
) {
  if (props.type === 'no-wind') {
    return <NoWindIcon {...props} />
  }
  return <WindIcon {...props} />
}

export function WindIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 8h8.5a2.5 2.5 0 1 0 -2.34 -3.24" />
      <path d="M3 12h15.5a2.5 2.5 0 1 1 -2.34 3.24" />
      <path d="M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24" />
    </IconBase>
  )
}

export function NoWindIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 8h3m4 0h1.5a2.5 2.5 0 1 0 -2.34 -3.24" />
      <path d="M3 12h9" />
      <path d="M16 12h2.5a2.5 2.5 0 0 1 1.801 4.282" />
      <path d="M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24" />
      <path d="M3 3l18 18" />
    </IconBase>
  )
}
