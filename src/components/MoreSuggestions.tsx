import { ActivityScore } from '@/lib/db/helpers/activity'
import { TimeZoneContext } from '@/lib/utils/contexts'
import { utcDateStringToLocalTimeString } from '@/lib/utils/dates'
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
      <div className="mx-4 mb-4 md:m-8">
        <button
          className="btn btn-primary btn-md md:btn-lg rounded-md sm:w-48 md:w-fit"
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
  return (
    <dialog className={'modal'} id={dialogId}>
      <div className="modal-box max-h-5xl max-w-5xl">
        <div className="flex flex-col justify-start">
          {activityScores.map((score, i) => (
            <SingleActivityScore key={`score-${i}`} score={score} />
          ))}
        </div>
      </div>
      <form className="modal-backdrop" method="dialog">
        <button>close</button>
      </form>
    </dialog>
  )
}

function SingleActivityScore({ score }: { score: ActivityScore }) {
  const { timeZone } = React.useContext(TimeZoneContext)
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
        <div className="text-2xl font-extrabold">
          {score.name}
          <span className={'px-4 font-normal'}>at</span>
          {utcDateStringToLocalTimeString(score.timestamp, {
            tz: timeZone,
          })}
        </div>
        <span className="flex flex-row items-center gap-2">
          {renderScore(score.score)}
          <span>{score.score * 100}%</span>
        </span>
      </div>
      <div className="text-sm font-thin">{score.description}</div>
      {/*<div>{JSON.stringify(score.debug)}</div>*/}
    </div>
  )
}

const renderScore = (score: number) => {
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
