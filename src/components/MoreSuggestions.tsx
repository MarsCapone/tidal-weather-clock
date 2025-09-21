import { ActivityScore } from '@/lib/db/helpers/activity'
import getHumanReadableScore from '@/lib/utils/activity-score-formatter'
import { TimeZoneContext } from '@/lib/utils/contexts'
import {
  utcDateStringToLocalTimeString,
  utcDateStringToUtc,
} from '@/lib/utils/dates'
import {
  ActivityScoreWithInterval,
  groupActivityScores,
} from '@/lib/utils/group-activity-score'
import { differenceInHours, endOfToday, formatISO, isBefore } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import React from 'react'

export type MoreSuggestionsProps = {
  activityScores: ActivityScore[]
}

export default function MoreSuggestions({
  activityScores,
}: MoreSuggestionsProps) {
  const dialogId = `more-suggestions-${Math.random().toString(36)}`
  const openDialog = () => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }

  if (activityScores.length === 0) {
    return (
      <MoreSuggestionsButton disabled={true} text={'No activity suggestions'} />
    )
  }

  return (
    <>
      <MoreSuggestionsButton
        onClick={openDialog}
        disabled={false}
        text={'See more suggestions'}
      />
      <MoreSuggestionsDialog
        dialogId={dialogId}
        activityScores={activityScores}
      />
    </>
  )
}

type MoreSuggestionsButtonProps =
  | {
      onClick: () => void
      disabled: false
      text: string
      description?: string
    }
  | {
      onClick?: () => void
      disabled: true
      text: string
      description?: string
    }

function MoreSuggestionsButton({
  onClick,
  disabled,
  text,
  description,
}: MoreSuggestionsButtonProps) {
  return (
    <div className="mx-4 mb-4 lg:m-4">
      <button
        className={`btn btn-primary btn-md md:btn-lg w-fit rounded-md ${disabled ? 'btn-disabled' : ''}`}
        onClick={onClick}
      >
        <div className="flex flex-col">
          <div>{text}</div>
          {description && (
            <div className="text-xs font-thin">({description})</div>
          )}
        </div>
      </button>
    </div>
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
  console.log(groupedScores)
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

  const interval = {
    start: utcDateStringToUtc(start),
    end: utcDateStringToUtc(end),
  }

  const summaryInterval =
    differenceInHours(interval.end, interval.start) >= 23
      ? 'any time'
      : isBefore(interval.start, new Date()) &&
          differenceInHours(endOfToday(), interval.end) <= 1
        ? 'for the rest of the day'
        : ''

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
    <>
      {summaryInterval && <span>({summaryInterval})</span>}
      <div className="flex flex-row items-center gap-1">
        <LocalTime timestamp={start} />
        <div className={'px-4 font-normal'}>
          <ArrowRight className="h-6 w-6" />
        </div>
        <LocalTime timestamp={end} />
      </div>
    </>
  )
}

function ExplainedScore({ score }: { score: ActivityScore }) {
  const readableScores = getHumanReadableScore(score.debug)
  const constraintTypes = score.debug.constraintsWithScores.map(
    (c) => c.constraint.type,
  )

  const conditions = Object.entries(readableScores.conditions)
    .filter(([k]) => constraintTypes.includes(k as never))
    .map(([, v]) => v)

  if (conditions.length === 0) {
    return null
  }

  return (
    <div>
      <div className={'grid grid-cols-3'}>
        <div></div>
        <div className={'divider'}>constraint details</div>
        <div></div>
      </div>
      <div
        className={`grid ${conditions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} text-sm`}
      >
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
