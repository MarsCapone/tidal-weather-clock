import React from 'react'
import {
  JsonEditor,
  JsonEditorProps,
  githubDarkTheme,
  githubLightTheme,
} from 'json-edit-react'

export type GenericObjectProps = {
  obj: any
  className?: string
  options?: {
    decimalPlaces?: number
    jsonEditorProps?: Partial<JsonEditorProps>
    useJsonEditor?: boolean
  }
}

export default function GenericObject({
  obj,
  className,
  options,
}: GenericObjectProps) {
  const renderValue = (v: number | string | boolean) => {
    if (v === null) return 'NULL'
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
      <div key={`${key}-l${level}`} className="flex gap-2 text-xs font-mono">
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
      data: obj,
      viewOnly: true,
      enableClipboard: false,
      rootName: '',
      showArrayIndices: false,
      showStringQuotes: false,
      showCollectionCount: false,
      minWidth: 350,
      collapse: 1,
      theme: githubLightTheme, // isDarkTheme ? githubDarkTheme : githubLightTheme,
      rootFontSize: 15,
      ...(options?.jsonEditorProps || {}),
    }
    return <JsonEditor {...jsonEditorProps} className="" />
  }

  if (obj === null || obj === undefined) {
    return <div></div>
  }

  if (typeof obj === 'object') {
    return <div>{renderObject(obj, className)}</div>
  }
  return <div>{renderValue(obj)}</div>
}
