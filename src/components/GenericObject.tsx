import { DarkModeContext } from '@/utils/contexts'
import {
  githubDarkTheme,
  githubLightTheme,
  JsonEditor,
  JsonEditorProps,
} from 'json-edit-react'
import React, { useContext } from 'react'

export type GenericObjectProps = {
  className?: string
  obj: any
  options?: {
    decimalPlaces?: number
    jsonEditorProps?: Partial<JsonEditorProps>
    useJsonEditor?: boolean
  }
}

export default function GenericObject({
  className,
  obj,
  options,
}: GenericObjectProps) {
  const { isDarkMode } = useContext(DarkModeContext)
  const renderValue = (v: number | string | boolean) => {
    if (v === null) {
      return 'NULL'
    }
    switch (typeof v) {
      case 'number':
        return v.toFixed(
          options?.decimalPlaces !== undefined ? options?.decimalPlaces : 0,
        )
      case 'boolean':
        return String(v)
      case 'undefined':
        return 'UNDEFINED'
      default:
        return v
    }
  }

  const renderObject = (
    o: Record<string, any>,
    className?: string,
    level: number = 0,
  ) => {
    return Object.entries(o).map(([key, value]) => (
      <div className="flex gap-2 font-mono text-xs" key={`${key}-l${level}`}>
        <div className={`font-bold ${className}`}>{key}</div>
        <div>
          {value === null || value === undefined
            ? renderValue(value)
            : typeof value === 'object'
              ? renderObject(value, className, level + 1)
              : renderValue(value)}
        </div>
      </div>
    ))
  }
  if (options?.jsonEditorProps !== undefined || options?.useJsonEditor) {
    const jsonEditorProps: JsonEditorProps = {
      collapse: 1,
      data: obj,
      enableClipboard: false,
      minWidth: 350,
      rootFontSize: 15,
      rootName: '',
      showArrayIndices: false,
      showCollectionCount: false,
      showStringQuotes: false,
      theme: isDarkMode ? githubDarkTheme : githubLightTheme,
      viewOnly: true,
      ...(options?.jsonEditorProps || {}),
    }
    return <JsonEditor {...jsonEditorProps} />
  }

  if (obj === null || obj === undefined) {
    return <div></div>
  }

  if (typeof obj === 'object') {
    return <div>{renderObject(obj, className)}</div>
  }

  return <div>{renderValue(obj)}</div>
}
