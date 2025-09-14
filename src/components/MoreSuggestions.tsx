import { ActivityScore } from '@/lib/db/helpers/activity'
import getHumanReadableScore from '@/lib/utils/activity-score-formatter'
import { TimeZoneContext } from '@/lib/utils/contexts'
import { utcDateStringToLocalTimeString } from '@/lib/utils/dates'
import {
  ActivityScoreWithInterval,
  groupActivityScores,
} from '@/lib/utils/group-activity-score'
import { formatISO } from 'date-fns'
import { JsonEditor } from 'json-edit-react'
import { ArrowRight } from 'lucide-react'
import React from 'react'

export type MoreSuggestionsProps = {
  activityScores: ActivityScore[]
  allActivityScores: ActivityScore[]
}

export default function MoreSuggestions({
  activityScores,
  allActivityScores,
}: MoreSuggestionsProps) {
  const dialogId = `more-suggestions-${Math.random().toString(36)}`
  const openDialog = () => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }

  let text = ''
  let description = ''
  let passedActivities = activityScores

  if (activityScores.length === 0 && allActivityScores.length > 0) {
    text = 'See all activities'
    description = 'no rated suggestions'
    passedActivities = allActivityScores
  } else if (activityScores.length > 0) {
    text = 'See more suggestions'
  } else {
    description = 'try adding more activities or loosening constraints'
  }

  return (
    <>
      <div className="mx-4 mb-4 lg:m-4">
        <button
          className={`btn btn-primary btn-md md:btn-lg w-fit rounded-md ${text === '' ? 'btn-disabled' : ''}`}
          onClick={openDialog}
        >
          <div className="flex flex-col">
            <div>{text || 'No suggestions available'}</div>
            {activityScores.length === 0 && (
              <div className="text-xs font-thin">({description})</div>
            )}
          </div>
        </button>
      </div>
      <MoreSuggestionsDialog
        dialogId={dialogId}
        activityScores={passedActivities}
      />
    </>
  )
}

type MoreSuggestionsDialogProps = {
  dialogId: string
  activityScores: ActivityScore[]
}

function MoreSuggestionsDialog({
  dialogId,
  activityScores,
}: MoreSuggestionsDialogProps) {
  const groupedScores = groupActivityScores(activityScores)

  return (
    <dialog className={'modal'} id={dialogId}>
      <div className="modal-box max-h-5xl max-w-5xl">
        <div className="flex flex-col justify-start">
          {groupedScores.flatMap((score, index) => (
            <React.Fragment key={`score-${index}`}>
              {!!index && <div className={'divider'} />}
              <SingleActivityScore score={score} />
            </React.Fragment>
          ))}
        </div>
      </div>
      <form className="modal-backdrop" method="dialog">
        <button>close</button>
      </form>
    </dialog>
  )
}

function SingleActivityScore({ score }: { score: ActivityScoreWithInterval }) {
  const scoreOutOfFive = (score.score * 5).toFixed(1)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-2xl font-extrabold">{score.name}</div>
        <div className="text-sm font-thin italic">{score.description}</div>
        <Interval
          start={score.interval.startTimestamp}
          end={score.interval.endTimestamp}
        />
        <span className="flex flex-row items-center gap-2">
          {renderScore(score.score)}
          <span>({scoreOutOfFive})</span>
        </span>
      </div>
      <ExplainedScore score={score} />
      <div className={'mt-4 flex flex-row justify-end text-xs font-thin'}>
        {score.activityId}:v{score.activityVersion}
      </div>
    </div>
  )
}

function Interval({ start, end }: { start: string; end: string }) {
  const { timeZone } = React.useContext(TimeZoneContext)
  function LocalTime({ timestamp }: { timestamp: string }) {
    return (
      <div>
        <div className="flex flex-col items-center gap-0 text-xl font-bold">
          <span>
            {utcDateStringToLocalTimeString(timestamp, { tz: timeZone })}
          </span>
          <span className="text-xs font-thin">
            {formatISO(timestamp, { representation: 'date' })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <LocalTime timestamp={start} />
      <div className={'px-4 font-normal'}>
        <ArrowRight className="h-6 w-6" />
      </div>
      <LocalTime timestamp={end} />
    </div>
  )
}

function ExplainedScore({ score }: { score: ActivityScore }) {
  const readableScores = getHumanReadableScore(score.debug)

  const conditions = Object.values(readableScores.conditions)

  return (
    <div>
      <div className={'divider'}></div>
      <div className={'grid grid-cols-2 text-sm'}>
        {conditions.map((c, i) => (
          <p key={i}>{c}</p>
        ))}
      </div>
    </div>
  )
}

function renderScore(score: number): React.ReactElement {
  // max score is 1. 5 half stars gives 10 possible options
  const outOf10 = Math.round(score * 10)
  return (
    <div className="rating rating-xs md:rating-sm rating-half">
      {[...Array(10)].map((_, v: number) => (
        <div
          aria-current={v + 1 === outOf10}
          className={`mask mask-star-2 ${v % 2 == 0 ? 'mask-half-1' : 'mask-half-2'}`}
          key={`star-part-${v}`}
        />
      ))}
    </div>
  )
}
