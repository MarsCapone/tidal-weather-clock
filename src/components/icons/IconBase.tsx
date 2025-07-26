// all icons from https://tablericons.com/

export function IconBase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={props.className}
      fill={props.fill || 'none'}
      height={props.height || 16}
      stroke={props.stroke || 'currentColor'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props.strokeWidth || 1}
      viewBox="0 0 24 24"
      width={props.width || 16}
      xmlns="http://www.w3.org/2000/svg"
    >
      {props.children}
    </svg>
  )
}
