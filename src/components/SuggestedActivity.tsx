import { Constraint } from '@/lib/types/activity'
import { DarkModeContext } from '@/lib/utils/contexts'
import { formatInterval } from '@/lib/utils/dates'
import {
  ActivityGroupInfo,
  EnrichedActivityScore,
} from '@/lib/utils/suggestions'
import MarkdownPreview from '@uiw/react-markdown-preview'
import { addHours, compareAsc } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import React, { useContext, useEffect } from 'react'
import GenericObject from './GenericObject'

export type SuggestedActivityProps = {
  activityScore: EnrichedActivityScore | null
  className?: string
  nextSuggestion?: () => void
  prevSuggestion?: () => void
}

const INTERVAL_LIMIT = 3

export default function SuggestedActivity({
  activityScore,
  className,
  nextSuggestion,
  prevSuggestion,
}: SuggestedActivityProps) {
  const { useDescriptiveIntervals } = useFlags()

  // don't show this panel at all if there is nothing to show
  if (!activityScore) {
    return null
  }

  const intervals = getActivityGroupInfo(activityScore)

  return (
    <SuggestedActivityContent className={className}>
      <p className="text-2xl font-extrabold">{activityScore.activity.name}</p>
      <div className="text-base-content/50 flex flex-row justify-around gap-4 font-mono text-sm md:flex-col lg:flex-row">
        {intervals.map((agi, i) => (
          <div
            className="flex flex-col justify-center md:gap-x-2"
            key={`interval-${i}`}
          >
            {formatInterval(agi.interval, 1, useDescriptiveIntervals).map(
              (part, j) => (
                <div key={j}>{part}</div>
              ),
            )}
            <div>{renderScore(agi.score)}</div>
          </div>
        ))}
      </div>
      <div className="card-actions">
        <div className="w-full">
          <div className="flex flex-row justify-between gap-2 md:flex-col lg:flex-row">
            <NavButton
              direction="prev"
              disabled={prevSuggestion === undefined}
              onClick={prevSuggestion}
            />
            <ExplainButton selection={activityScore} />
            <NavButton
              direction="next"
              disabled={nextSuggestion === undefined}
              onClick={nextSuggestion}
            />
          </div>
        </div>
      </div>
    </SuggestedActivityContent>
  )
}

export function getActivityGroupInfo(
  activityScore: EnrichedActivityScore,
): ActivityGroupInfo[] {
  return 'intervals' in activityScore
    ? activityScore.intervals!.slice(0, INTERVAL_LIMIT)
    : [
        {
          constraintScores: activityScore.constraintScores,
          interval: activityScore.interval,
          score: activityScore.score,
          slot: activityScore.debug?.slot,
        },
      ]
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
        suggestedActivity={selection}
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
  onClick?: () => void
}
function NavButton({
  className,
  direction,
  disabled,
  onClick,
}: NavButtonProps) {
  return (
    <button
      className={`btn btn-secondary join-item rounded-sm lg:w-1/4 ${disabled ? 'disabled btn-disabled' : ''} ${className || ''}`}
      onClick={() => {
        if (!disabled && onClick) {
          onClick()
        }
      }}
    >
      {direction === 'next' ? 'Next' : 'Previous'}
    </button>
  )
}

type SuggestedActivityExplanationDialogProps = {
  dialogId: string
  suggestedActivity: EnrichedActivityScore
}
function SuggestedActivityExplanationDialog({
  dialogId,
  suggestedActivity,
}: SuggestedActivityExplanationDialogProps) {
  const { debugMode, usAiExplanations: useAiExplanations } = useFlags()
  const [aiExplanations, setAiExplanations] = React.useState<string[] | null>(
    null,
  )
  const { isDarkMode } = useContext(DarkModeContext)

  useEffect(() => {
    if (!useAiExplanations) {
      return
    }

    // the relevant information to send to the AI for explanation is:
    // - the activity name
    // - the intervals with scores
    // - the constraints
    // - the context
    const intervals: ActivityGroupInfo[] = (
      suggestedActivity.intervals || [
        {
          constraintScores: suggestedActivity.constraintScores,
          interval: suggestedActivity.interval,
          score: suggestedActivity.score,
          slot: suggestedActivity.debug?.slot,
        },
      ]
    )
      .sort((a, b) => compareAsc(a.interval.start, b.interval.start))
      .map((agi) => {
        const { start, end } = agi.interval
        return {
          ...agi,
          interval: {
            start,
            end: addHours(end, 1), // end is inclusive, so we add 1 hour to make it exclusive
          },
        }
      })

    const scope = {
      activityName: suggestedActivity.activity.name,
      activityPriority: suggestedActivity.activity.priority,
      contexts: intervals,
      constraints: suggestedActivity.activity.constraints,
    }

    fetch('/api/explain', {
      method: 'POST',
      body: JSON.stringify({ scope, debugMode }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.explanation) {
          setAiExplanations(data.explanation)
        }
      })
  }, [suggestedActivity, debugMode, useAiExplanations])

  const intervals = (
    'intervals' in suggestedActivity
      ? suggestedActivity.intervals!
      : [
          {
            constraintScores: suggestedActivity.constraintScores,
            interval: suggestedActivity.interval,
            score: suggestedActivity.score,
            slot: suggestedActivity.debug?.slot,
          },
        ]
  ).sort((a, b) => compareAsc(a.interval.start, b.interval.start))

  const constraintsMap: {
    [p: string]: Omit<Constraint, 'type'>
  } = Object.fromEntries(
    suggestedActivity.activity.constraints.map((constraint, index) => {
      const { type, ...constraintWithoutType } = constraint

      return [`${index}:${type}`, constraintWithoutType]
    }),
  )

  return (
    <dialog className="modal" id={dialogId}>
      <div className="modal-box max-h-5xl h-11/12 w-11/12 max-w-5xl">
        <p className="text-2xl font-extrabold">
          {suggestedActivity.activity.name}
        </p>
        <div className="">
          <div className="overflow-x-auto">
            <table className="table-primary table-md table-pin-rows table">
              <thead>
                <tr>
                  <th className="min-w-32">Time</th>
                  <th>Average Score</th>
                  {useAiExplanations && <th>Explanation</th>}
                  {(debugMode || !useAiExplanations) && (
                    <>
                      <th>Detailed Score</th>
                      <th>Configuration</th>
                      <th>Context</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {intervals.map((interval, i) => {
                  return (
                    <tr key={`$interval-${i}`}>
                      <td className="align-text-top">
                        {formatInterval(interval.interval, 1)}
                      </td>
                      <td className="flex flex-col align-text-top">
                        <span>{interval.score.toFixed(3)}</span>
                        <span>{renderScore(interval.score)}</span>
                      </td>
                      {useAiExplanations && (
                        <td className="align-text-top">
                          <MarkdownPreview
                            source={
                              aiExplanations
                                ? aiExplanations[i]
                                  ? aiExplanations[i].trim()
                                  : 'No explanation available'
                                : 'Thinking...'
                            }
                            className=""
                            wrapperElement={{
                              'data-color-mode': isDarkMode ? 'dark' : 'light',
                            }}
                          />
                        </td>
                      )}
                      {(debugMode || !useAiExplanations) && (
                        <>
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
                                '+:priority':
                                  suggestedActivity.activity.priority,
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
                            <GenericObject
                              className={'w-20'}
                              obj={interval.slot || {}}
                              options={{
                                jsonEditorProps: {
                                  minWidth: 300,
                                },
                              }}
                            />
                          </td>
                        </>
                      )}
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
