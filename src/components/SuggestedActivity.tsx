import { ActivityScore } from '@/lib/db/helpers/activity'
import { Constraint } from '@/lib/types/activity'
import { DarkModeContext, TimeZoneContext } from '@/lib/utils/contexts'
import {
  formatInterval,
  utcDateStringToLocalTimeString,
} from '@/lib/utils/dates'
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
  activityScore: ActivityScore | null
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
  const { timeZone } = useContext(TimeZoneContext)

  // don't show this panel at all if there is nothing to show
  if (!activityScore) {
    return null
  }

  return (
    <SuggestedActivityContent className={className}>
      <div className="flex flex-col justify-center gap-8 md:flex-row">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <div className="text-2xl font-extrabold">
            {activityScore.name}
            <span className={'px-4 font-normal'}>at</span>
            {utcDateStringToLocalTimeString(activityScore.timestamp, {
              tz: timeZone,
            })}
          </div>
          <span className="flex flex-row items-center gap-1">
            ({renderScore(activityScore.score)})
          </span>
        </div>
        <div className="flex flex-row justify-between gap-2 md:flex-col lg:flex-row">
          <NavButton
            direction="prev"
            disabled={prevSuggestion === undefined}
            onClick={prevSuggestion}
          />
          <NavButton
            direction="next"
            disabled={nextSuggestion === undefined}
            onClick={nextSuggestion}
          />
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

function SuggestedActivityContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`card card-md ${className || ''}`}>
      <div className="card-body">
        <div className="card-title font-thin">The next best activity is...</div>
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
      className={`btn btn-secondary join-item w-36 rounded-sm sm:w-48 ${disabled ? 'disabled btn-disabled' : ''} ${className || ''}`}
      onClick={() => {
        if (!disabled && onClick) {
          onClick()
        }
      }}
    >
      {direction === 'next' ? 'Next' : 'Previous'}
      <span className="hidden sm:block">suggestion</span>
    </button>
  )
}
