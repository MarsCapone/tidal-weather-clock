import { ActivityScore } from '@/types/activity'
import { useFeatureFlags } from '@/ui/hooks/useFeatureFlags'
import React, { useState } from 'react'
import {
  DefaultActivityScore,
  EnrichedActivityScore,
  groupScores,
} from '@/ui/utils/suggestions'
import { formatInterval } from '@/ui/utils/dates'
import { compareAsc } from 'date-fns'
import GenericObject from './GenericObject'

export type SuggestedActivityProps = {
  className?: string
  dialogId: string
  suggestions: DefaultActivityScore[]
  index: number
  setIndex: (v: number) => void
}

const INTERVAL_LIMIT = 3

export default function SuggestedActivity({
  className,
  dialogId,
  suggestions,
  index,
  setIndex,
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
            interval: selection.interval,
            score: selection.score,
            constraintScores: selection.constraintScores,
          },
        ]

  const intervalView = intervals.map((agi, i) => (
    <div
      key={`interval-${i}`}
      className="flex flex-col md:flex-row lg:flex-col justify-center md:gap-x-2"
    >
      <div>{formatInterval(agi.interval, 1)}</div>
      <div>{renderScore(agi.score)}</div>
    </div>
  ))

  return (
    <>
      <SuggestedActivityContent className={className}>
        <p className="text-2xl font-extrabold">{selection.activity.name}</p>
        <div className="flex flex-row md:flex-col lg:flex-row text-sm font-mono text-base-content/50 justify-around gap-4">
          {intervalView}
        </div>
        <div className="card-actions">
          <div className="w-full">
            <div className="flex flex-col lg:hidden gap-y-2 items-center">
              <ExplainButton selection={selection} />
              {hasCardActions && (
                <div className="join">
                  {prevButton}
                  {nextButton}
                </div>
              )}
            </div>
            <div className="hidden lg:flex flex-row justify-between gap-x-2">
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
          key={`star-part-${v}`}
          className={`mask mask-star-2 ${v % 2 == 0 ? 'mask-half-1' : 'mask-half-2'}`}
          aria-current={v + 1 === outOf10}
        />
      ))}
    </div>
  )
}

export type ExplainButtonProps = {
  selection: EnrichedActivityScore
}

export function ExplainButton({ selection }: ExplainButtonProps) {
  if (!selection || !selection.activity) return null

  const dialogId = `explain-${Math.random().toString(36)}`
  const openDialog = () => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }
  return (
    <>
      <div className="btn btn-primary flex-grow" onClick={() => openDialog()}>
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
      className={`btn btn-outline join-item ${disabled ? 'disabled' : ''} ${className || ''}`}
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
            interval: selection.interval,
            score: selection.score,
            constraintScores: selection.constraintScores,
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
      <div className="modal-box w-11/12 max-w-5xl h-11/12 max-h-5xl">
        <p className="text-2xl font-extrabold">{selection.activity.name}</p>
        <div className="">
          <div className="overflow-x-auto">
            <table className="table table-primary table-md table-pin-rows">
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
                            obj={interval.constraintScores}
                            options={{
                              decimalPlaces: 2,
                            }}
                            className={'w-40 text-sm'}
                          />
                        )}
                      </td>
                      <td className="align-text-top">
                        <GenericObject
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
                          className={'w-20'}
                        />
                      </td>
                      <td className="align-text-top">
                        {selection.debug?.slot && (
                          <GenericObject
                            obj={selection.debug.slot}
                            options={{
                              jsonEditorProps: {
                                minWidth: 300,
                              },
                            }}
                            className={'w-20'}
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
