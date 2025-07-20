import { Link } from 'react-router'
import React from 'react'
import { Activities } from '@/ui/constants'
import ExplanationReason from '@/ui/components/ExplanationReason'

export default function Settings() {
  const constraints = Activities[0].constraints

  return (
    <div>
      <p className="link text-xl mb-4">
        <Link to={'/settings/internal'}>Internal Settings</Link>
      </p>
      <div className="">
        <div className="grid grid-rows-2 md:grid-rows-0 md:grid-cols-2 gap-4">
          <Pane
            title="Constraints"
            description="Constraints are individual reasons that must be matched in order to do an activity"
          >
            {constraints.map((constraint, index) => (
              <ExplanationReason
                key={`constraint-${index}`}
                constraint={constraint}
              />
            ))}
          </Pane>
          <Pane
            title="Activities"
            description="Activities are something you can do based on a collection of constraints"
          >
            <li className={'list-row'}> activity 1 </li>
            <li className={'list-row'}> activity 1 </li>
            <li className={'list-row'}> activity 1 </li>
            <li className={'list-row'}> activity 1 </li>
          </Pane>
        </div>
      </div>
    </div>
  )
}

function Pane({
  title,
  description,
  onClick,
  children,
}: {
  title: string
  description: string
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="card card-xl shadow-md p-4 gap-4 h-[70dvh]">
      <div className="flex justify-between items-center">
        <div className="text-xl text-base-content">{title}</div>
        <button className="btn btn-primary" onClick={onClick}>
          + Add New
        </button>
      </div>

      <div className="text-xs opacity-60">{description}</div>

      <ul className="list overflow-scroll">{children}</ul>
    </div>
  )
}
