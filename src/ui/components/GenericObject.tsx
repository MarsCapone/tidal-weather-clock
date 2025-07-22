import React from 'react'

export default function GenericObject({
  obj,
  className,
}: {
  obj: any
  className?: string
}) {
  if (typeof obj === 'object') {
    return <div>{renderObject(obj, className)}</div>
  }
  return <div>{renderValue(obj)}</div>
}

const renderValue = (v: number | string | boolean) => {
  if (v === null) return 'NULL'
  switch (typeof v) {
    case 'number':
      return v.toFixed(3)
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
      <div className={`uppercase font-bold ${className}`}>{key}</div>
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
