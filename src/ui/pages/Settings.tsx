import { Link } from 'react-router'
import React from 'react'
import { Activities } from '@/constants'
import ExplanationReason, {
  explainConstraint,
} from '@/ui/components/ExplanationReason'
import { Activity } from '@/types/legacyActivities'

export default function Settings() {
  const constraints = Activities[0].constraints
  const activities = Activities

  return (
    <div>
      <p className="link text-xl mb-4">
        <Link to={'/settings/internal'}>Internal Settings</Link>
      </p>
      <div className="">
        <div className="grid grid-rows-2 md:grid-rows-0 md:grid-cols-2 gap-4">
          <Pane
            description="Constraints are individual reasons that must be matched in order to do an activity"
            title="Constraints"
          >
            {constraints.map((constraint, index) => (
              <li className={'list-row'} key={`constraint-${index}`}>
                <ExplanationReason constraint={constraint} />
              </li>
            ))}
          </Pane>
          <Pane
            description="Activities are something you can do based on a collection of constraints"
            title="Activities"
          >
            {activities.map((activity, index) => (
              <li className={'list-row'} key={`activity-${index}`}>
                <ActivityForm activity={activity} />
              </li>
            ))}
          </Pane>
        </div>
      </div>
    </div>
  )
}

function Pane({
  children,
  description,
  onClick,
  title,
}: {
  children?: React.ReactNode
  description: string
  onClick?: () => void
  title: string
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

function ActivityForm({ activity }: { activity: Activity }) {
  return (
    <div className="">
      <div className="flex flex-row justify-between items-center">
        <div className="text-lg">{activity.displayName}</div>
        <div className="flex gap-1">
          <div className="btn btn-warning btn-xs">Edit</div>
          <div className="btn btn-error btn-xs">Delete</div>
        </div>
      </div>
      <div className="text-md w-dvw">
        <ul>
          {activity.constraints.map((constraint, i) => (
            <li key={`constraint-${i}`}>
              {explainConstraint(constraint)?.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
