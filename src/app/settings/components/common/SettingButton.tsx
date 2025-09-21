import { HTMLProps } from 'react'

export default function SettingButton(props: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={'submit'}
      className={`btn btn-sm md:btn-md rounded-field ${props.disabled && 'btn-disabled'} ${props.className || ''}`}
    >
      {props.children}
    </button>
  )
}
