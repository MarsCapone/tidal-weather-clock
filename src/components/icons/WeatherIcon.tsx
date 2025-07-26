import { RainCloudIcon, SnowCloudIcon } from '@/components/icons/CloudIcon'
import { IconBase } from './IconBase'

export default function WeatherIcon(
  props: React.SVGProps<SVGSVGElement> & {
    type?: 'generic' | 'rain' | 'snow' | 'sun' | 'storm' | 'haze'
  },
) {
  switch (props.type) {
    case 'rain':
      return <RainCloudIcon {...props} />
    case 'snow':
      return <SnowCloudIcon {...props} />
    case 'sun':
      return <SunnyIcon {...props} />
    case 'storm':
      return <StormIcon {...props} />
    case 'haze':
      return <HazeIcon {...props} />
    default:
      return <GenericWeatherIcon {...props} />
  }
}

export function GenericWeatherIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M14.468 10a4 4 0 1 0 -5.466 5.46" />
      <path d="M2 12h1" />
      <path d="M11 3v1" />
      <path d="M11 20v1" />
      <path d="M4.6 5.6l.7 .7" />
      <path d="M17.4 5.6l-.7 .7" />
      <path d="M5.3 17.7l-.7 .7" />
      <path d="M15 13h5a2 2 0 1 0 0 -4" />
      <path d="M12 16h5.714l.253 0a2 2 0 0 1 2.033 2a2 2 0 0 1 -2 2h-.286" />
    </IconBase>
  )
}

export function SunnyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656z" />
      <path d="M6.343 17.657l-1.414 1.414" />
      <path d="M6.343 6.343l-1.414 -1.414" />
      <path d="M17.657 6.343l1.414 -1.414" />
      <path d="M17.657 17.657l1.414 1.414" />
      <path d="M4 12h-2" />
      <path d="M12 4v-2" />
      <path d="M20 12h2" />
      <path d="M12 20v2" />
    </IconBase>
  )
}

export function StormIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M5.369 14.236c-1.839 -3.929 -1.561 -7.616 -.704 -11.236" />
      <path d="M18.63 9.76c1.837 3.928 1.561 7.615 .703 11.236" />
    </IconBase>
  )
}

export function HazeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 12h1" />
      <path d="M12 3v1" />
      <path d="M20 12h1" />
      <path d="M5.6 5.6l.7 .7" />
      <path d="M18.4 5.6l-.7 .7" />
      <path d="M8 12a4 4 0 1 1 8 0" />
      <path d="M3 16h18" />
      <path d="M3 20h18" />
    </IconBase>
  )
}
