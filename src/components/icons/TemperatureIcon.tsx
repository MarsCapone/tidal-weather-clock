import { IconBase } from './IconBase'

export default function TemperatureIcon(
  props: React.SVGProps<SVGSVGElement> & { type?: 'celsius' | 'thermometer' },
) {
  if (props.type === 'thermometer') {
    return <ThermometerIcon {...props} />
  }
  return <CelsiusIcon {...props} />
}

export function CelsiusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M20 9a3 3 0 0 0 -3 -3h-1a3 3 0 0 0 -3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3 -3" />
    </IconBase>
  )
}

export function ThermometerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5" />
      <path d="M10 9l4 0" />
    </IconBase>
  )
}
