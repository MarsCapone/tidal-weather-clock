/*
Here's a more detailed breakdown:
Clear: Less than 1/8 (or 12.5%) cloud cover.
Few: 1/8 to 2/8 (12.5% to 25%) cloud cover.
Scattered: 3/8 to 4/8 (37.5% to 50%) cloud cover.
Broken: 5/8 to 7/8 (62.5% to 87.5%) cloud cover.
Overcast: 8/8 (100%) cloud cover.
In addition to these, terms like "mostly clear" and "mostly cloudy" are also used, typically corresponding to ranges like 10-30% and 70-80% cloud cover respectively, according to Spectrum News.
 */
import React from 'react'

export function describeCloudiness(cloudCover: number | undefined): string {
  if (cloudCover === undefined) {
    return 'Unknown'
  }
  if (cloudCover < 12.5) {
    return 'Clear'
  }
  if (cloudCover < 25) {
    return 'Mostly Clear'
  }
  if (cloudCover < 50) {
    return 'Scattered Clouds'
  }
  if (cloudCover < 87.5) {
    return 'Mostly Cloudy'
  }
  return 'Overcast'
}

export function describeWindDirection(
  direction: number,
  includeDegrees: boolean = true,
): string {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

  const val = Math.round((direction * points.length) / 360)

  const cardinal = points[(val + points.length) % points.length]

  if (!includeDegrees) {
    return cardinal
  }
  return `${cardinal} (${direction}º)`
}

export function describeUvIndex(uvIndex: number) {
  // https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage
  let color = '#B567A4'
  let description = 'Extreme'
  let invertText = true

  if (uvIndex < 3) {
    color = '#3EA72D'
    description = 'Low'
  } else if (uvIndex < 5) {
    color = '#FFF300'
    description = 'Moderate'
    invertText = false
  } else if (uvIndex < 8) {
    color = '#F18B00'
    description = 'High'
    invertText = false
  } else if (uvIndex < 11) {
    color = '#E53210'
    description = 'Very High'
  }

  return {
    description,
    styles: {
      backgroundColor: color,
      color: invertText ? 'white' : 'black',
    },
  }
}
