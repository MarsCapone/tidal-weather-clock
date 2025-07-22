import { formatInterval } from '@/ui/utils/dates'
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'
import { useState } from 'react'
import {
  DefaultActivityScore,
  EnrichedActivityScore,
  groupScores,
} from '@/ui/utils/suggestions'
import { ExplainButton, ExplainButtonProps } from './SuggestedActivity'

type ActivityScoreListProps = {
  scores: DefaultActivityScore[]
}

const DEFAULT_LIMIT = 3

export default function ActivityScoreList({ scores }: ActivityScoreListProps) {
  const [showInfeasible, setShowInfeasible] = useState(false)
  const [groupByTime, setGroupByTime] = useState(true)
  const [groupByActivity, setGroupByActivity] = useState(true)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)

  const filteredScores: EnrichedActivityScore[] = groupScores(
    scores.filter((item) => {
      if (showInfeasible) return true

      return item.feasible
    }),
    groupByTime && groupByActivity
      ? 'timeAndActivity'
      : groupByTime
        ? 'time'
        : 'none',
  )

  return (
    <div className="">
      <div className="m-2 divider" />
      <div className="flex flex-col md:flex-row justify-end gap-4 md:gap-8 mb-2">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase">Group By</div>
          <label className="label">
            <input
              type="checkbox"
              className="checkbox checkbox-accent"
              checked={groupByTime}
              onChange={() => {
                if (groupByActivity && groupByTime) {
                  setGroupByActivity(false)
                }
                setGroupByTime(!groupByTime)
              }}
            />
            Time
          </label>
          <label className="label">
            <input
              type="checkbox"
              className="checkbox checkbox-accent"
              disabled={!groupByTime}
              checked={groupByActivity}
              onChange={() => setGroupByActivity(!groupByActivity)}
            />
            Activity
          </label>
        </div>
        <label className="label">
          Show infeasible
          <input
            type="checkbox"
            className="toggle"
            defaultChecked
            onChange={() => setShowInfeasible(!showInfeasible)}
          />
          Hide infeasible
        </label>
        <label className="input w-fit">
          Limit suggestions
          <input
            type="number"
            className="w-4"
            min={1}
            defaultValue={DEFAULT_LIMIT}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          />
          <span className="badge badge-neutral badge-xs">Optional</span>
        </label>
      </div>
      <div className="overflow-x-auto h-96">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>Activity Name</th>
              <th>Time</th>
              <th>Score</th>
              <th>Feasible?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.map((score: EnrichedActivityScore, i: number) => {
              const time =
                'intervals' in score
                  ? score
                      .intervals!.slice(0, limit || score.intervals!.length)
                      .map((agi, i) => [
                        <div key={`interval-${i}`}>
                          {formatInterval(agi.interval, 1)}
                        </div>,
                        <div
                          key={`divider-${i}`}
                          className="divider my-1 md:hidden"
                        />,
                      ])
                      .flat()
                  : formatInterval(score.interval, 1)

              const scoreVal =
                'intervals' in score
                  ? score
                      .intervals!.slice(0, limit || score.intervals!.length)
                      .map((agi, i) => (
                        <div key={`score-${i}`}>{agi.score.toFixed(3)}</div>
                      ))
                  : score.score.toFixed(3)

              return (
                <tr key={`score-${i}`}>
                  <td>
                    {score.activity.name} | {score.activity.id}
                  </td>
                  <td>{time}</td>
                  <td>{scoreVal}</td>
                  <td>
                    {score.feasible ? (
                      <CheckCircleIcon className="w-6 h-6 text-success" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-error" />
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col md:flex-row gap-2">
                      <ExplainButton selection={score} />
                      <div className="flex gap-2">
                        <div className="btn btn-warning btn-disabled flex-1">
                          <PencilIcon className="w-4 h-4 text-warning-content" />
                        </div>
                        <div className="btn btn-error btn-disabled flex-1">
                          <TrashIcon className="w-4 h-4 text-error-content" />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
