import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { formatInterval } from '@/utils/dates'
import {
  DefaultActivityScore,
  EnrichedActivityScore,
  groupScores,
} from '@/utils/suggestions'
import { compareAsc } from 'date-fns'
import React from 'react'
import GenericObject from './GenericObject'

export type SuggestedActivityProps = {
  className?: string
  index: number
  setIndex: (v: number) => void
  suggestions: DefaultActivityScore[]
}

const INTERVAL_LIMIT = 3

export default function SuggestedActivity({
  className,
  index,
  setIndex,
  suggestions,
}: SuggestedActivityProps) {
  const ff = useFeatureFlags()

  const filteredSuggestions = groupScores(
    suggestions.filter((r) => r.feasible),
    'timeAndActivity',
  )

  const selection =
    filteredSuggestions.length > 0 ? filteredSuggestions[index] : null

  // don't show this panel at all if there is nothing to show
  if (!selection) {
    return null
  }

  const hasCardActions =
    ff.alwaysShowActivityNextButton || filteredSuggestions.length > 1

  const prevButton = (
    <NavButton
      direction="prev"
      disabled={index === 0}
      index={index}
      setIndex={setIndex}
    />
  )
  const nextButton = (
    <NavButton
      direction="next"
      disabled={index === filteredSuggestions.length - 1}
      index={index}
      setIndex={setIndex}
    />
  )

  const intervals =
    'intervals' in selection
      ? selection.intervals!.slice(0, INTERVAL_LIMIT)
      : [
          {
            constraintScores: selection.constraintScores,
            interval: selection.interval,
            score: selection.score,
          },
        ]

  const intervalView = intervals.map((agi, i) => (
    <div
      className="flex flex-col justify-center md:flex-row md:gap-x-2 lg:flex-col"
      key={`interval-${i}`}
    >
      <div>{formatInterval(agi.interval, 1)}</div>
      <div>{renderScore(agi.score)}</div>
    </div>
  ))

  return (
    <>
      <SuggestedActivityContent className={className}>
        <p className="text-2xl font-extrabold">{selection.activity.name}</p>
        <div className="text-base-content/50 flex flex-row justify-around gap-4 font-mono text-sm md:flex-col lg:flex-row">
          {intervalView}
        </div>
        <div className="card-actions">
          <div className="w-full">
            <div className="flex flex-col items-center gap-y-2 lg:hidden">
              <ExplainButton selection={selection} />
              {hasCardActions && (
                <div className="join">
                  {prevButton}
                  {nextButton}
                </div>
              )}
            </div>
            <div className="hidden flex-row justify-between gap-x-2 lg:flex">
              {hasCardActions && prevButton}
              <ExplainButton selection={selection} />
              {hasCardActions && nextButton}
            </div>
          </div>
        </div>
      </SuggestedActivityContent>
    </>
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

export type ExplainButtonProps = {
  selection: EnrichedActivityScore
}

export function ExplainButton({ selection }: ExplainButtonProps) {
  if (!selection || !selection.activity) {
    return null
  }

  const dialogId = `explain-${Math.random().toString(36)}`
  const openDialog = () => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }
  return (
    <>
      <div
        className="btn btn-primary flex-grow rounded-sm"
        onClick={() => openDialog()}
      >
        Explain
      </div>
      <SuggestedActivityExplanationDialog
        dialogId={dialogId}
        selection={selection}
      />
    </>
  )
}

function SuggestedActivityContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`card card-lg shadow-sm ${className || ''}`}>
      <div className="card-body">
        <div className="card-title">Suggested Activity</div>
        {children}
      </div>
    </div>
  )
}

type NavButtonProps = {
  className?: string
  direction: 'next' | 'prev'
  disabled: boolean
  index: number
  setIndex?: (n: number) => void
}
function NavButton({
  className,
  direction,
  disabled,
  index,
  setIndex,
}: NavButtonProps) {
  return (
    <button
      className={`btn btn-secondary join-item w-1/4 rounded-sm ${disabled ? 'disabled btn-disabled' : ''} ${className || ''}`}
      onClick={() => {
        if (!disabled && setIndex) {
          setIndex(direction === 'next' ? index + 1 : index - 1)
        }
      }}
    >
      {direction === 'next' ? 'Next' : 'Previous'}
    </button>
  )
}

type SuggestedActivityExplanationDialogProps = {
  dialogId: string
  selection: EnrichedActivityScore
}
function SuggestedActivityExplanationDialog({
  dialogId,
  selection,
}: SuggestedActivityExplanationDialogProps) {
  const intervals = (
    'intervals' in selection
      ? selection.intervals!
      : [
          {
            constraintScores: selection.constraintScores,
            interval: selection.interval,
            score: selection.score,
          },
        ]
  ).sort((a, b) => compareAsc(a.interval.start, b.interval.start))

  const constraintsMap = Object.fromEntries(
    selection.activity.constraints.map((constraint, index) => {
      const { type, ...constraintWithoutType } = constraint

      return [`${index}:${type}`, constraintWithoutType]
    }),
  )

  return (
    <dialog className="modal" id={dialogId}>
      <div className="modal-box max-h-5xl h-11/12 w-11/12 max-w-5xl">
        <p className="text-2xl font-extrabold">{selection.activity.name}</p>
        <div className="">
          <div className="overflow-x-auto">
            <table className="table-primary table-md table-pin-rows table">
              <thead>
                <tr>
                  <th className="min-w-32">Time</th>
                  <th>Average Score</th>
                  <th>Detailed Score</th>
                  <th>Configuration</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                {intervals.map((interval, i) => {
                  return (
                    <tr key={`$interval-${i}`}>
                      <td className="align-text-top">
                        {formatInterval(interval.interval, 1)}
                      </td>
                      <td className="align-text-top">
                        {interval.score.toFixed(3)}
                        {renderScore(interval.score)}
                      </td>
                      <td className="align-text-top">
                        {interval.constraintScores && (
                          <GenericObject
                            className={'w-40 text-sm'}
                            obj={interval.constraintScores}
                            options={{
                              decimalPlaces: 2,
                            }}
                          />
                        )}
                      </td>
                      <td className="align-text-top">
                        <GenericObject
                          className={'w-20'}
                          obj={{
                            ...constraintsMap,
                            '+:priority': selection.activity.priority,
                          }}
                          options={{
                            decimalPlaces: 0,
                            jsonEditorProps: {
                              minWidth: 300,
                            },
                          }}
                        />
                      </td>
                      <td className="align-text-top">
                        {selection.debug?.slot && (
                          <GenericObject
                            className={'w-20'}
                            obj={selection.debug.slot}
                            options={{
                              jsonEditorProps: {
                                minWidth: 300,
                              },
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <form className="modal-backdrop" method="dialog">
        <button>close</button>
      </form>
    </dialog>
  )
}
