import { IconBase } from '@/components/icons/IconBase'

export default function SunStateIcon(
  props: React.SVGProps<SVGSVGElement> & { type?: 'sunrise' | 'sunset' },
) {
  if (props.type === 'sunset') {
    return <SunsetIcon {...props} />
  }
  return <SunriseIcon {...props} />
}

export function SunriseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 17h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 0 1 8 0" />
      <path d="M3 21l18 0" />
      <path d="M12 9v-6l3 3m-6 0l3 -3" />
    </IconBase>
  )
}

export function SunsetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 17h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 0 1 8 0" />
      <path d="M3 21l18 0" />
      <path d="M12 3v6l3 -3m-6 0l3 3" />
    </IconBase>
  )
}
