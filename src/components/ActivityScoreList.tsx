import { TimeZoneContext } from '@/lib/utils/contexts'
import { formatInterval } from '@/lib/utils/dates'
import {
  DefaultActivityScore,
  EnrichedActivityScore,
  groupScores,
} from '@/lib/utils/suggestions'
import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
} from 'lucide-react'
import { useContext, useState } from 'react'
import { ExplainButton } from './SuggestedActivity'

type ActivityScoreListProps = {
  scores: DefaultActivityScore[]
}

const DEFAULT_LIMIT = 3

export default function ActivityScoreList({ scores }: ActivityScoreListProps) {
  const [showInfeasible, setShowInfeasible] = useState(false)
  const [groupByTime, setGroupByTime] = useState(true)
  const [groupByActivity, setGroupByActivity] = useState(true)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const { timeZone } = useContext(TimeZoneContext)

  const dateFnOptions = { tz: timeZone }
  const filteredScores: EnrichedActivityScore[] = groupScores(
    scores.filter((item) => {
      if (showInfeasible) {
        return true
      }

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
      <div className="divider m-2" />
      <div className="mb-2 flex flex-col justify-end gap-4 md:flex-row md:gap-8">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase">Group By</div>
          <label className="label">
            <input
              checked={groupByTime}
              className="checkbox checkbox-accent"
              onChange={() => {
                if (groupByActivity && groupByTime) {
                  setGroupByActivity(false)
                }
                setGroupByTime(!groupByTime)
              }}
              type="checkbox"
            />
            Time
          </label>
          <label className="label">
            <input
              checked={groupByActivity}
              className="checkbox checkbox-accent"
              disabled={!groupByTime}
              onChange={() => setGroupByActivity(!groupByActivity)}
              type="checkbox"
            />
            Activity
          </label>
        </div>
        <label className="label">
          Show infeasible
          <input
            className="toggle"
            defaultChecked
            onChange={() => setShowInfeasible(!showInfeasible)}
            type="checkbox"
          />
          Hide infeasible
        </label>
        <label className="input w-fit">
          Limit suggestions
          <input
            className="w-8"
            defaultValue={DEFAULT_LIMIT}
            min={1}
            onChange={(e) => setLimit(Number.parseInt(e.target.value))}
            type="number"
          />
          <span className="badge badge-neutral badge-xs">Optional</span>
        </label>
      </div>
      <div className="h-96 overflow-x-auto">
        <table className="table-pin-rows table">
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
                      .flatMap((agi, i) => [
                        <div key={`interval-${i}`}>
                          {formatInterval(
                            agi.interval,
                            1,
                            false,
                            dateFnOptions,
                          )}
                        </div>,
                        <div
                          className="divider my-1 md:hidden"
                          key={`divider-${i}`}
                        />,
                      ])
                  : formatInterval(score.interval, 1, false, dateFnOptions)

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
                      <div
                        className="tooltip"
                        data-tip="None of the detailed scores were 0"
                      >
                        <CheckCircleIcon className="text-success h-6 w-6" />
                      </div>
                    ) : (
                      <div
                        className="tooltip"
                        data-tip="At least one of the detailed scores was 0"
                      >
                        <XCircleIcon className="text-error h-6 w-6" />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-2 md:flex-row">
                      <ExplainButton selection={score} />
                      <div className="hidden gap-2">
                        <div className="btn btn-warning btn-disabled flex-1">
                          <PencilIcon className="text-warning-content h-4 w-4" />
                        </div>
                        <div className="btn btn-error btn-disabled flex-1">
                          <TrashIcon className="text-error-content h-4 w-4" />
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
