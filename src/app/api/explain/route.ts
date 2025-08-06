import { generateText } from 'ai'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // Call the language model with the prompt
  const result = await generateText({
    model: 'amazon/nova-micro',
    prompt: 'say hello',
  })

  const rawMessages = result.response.messages.flatMap((message) => {
    const content = message.content as { text: string }[]
    return content.map((content) => content.text)
  })

  // Respond with a streaming response
  return Response.json({
    explanation: rawMessages.join('\n'),
  })
}

export async function POST(req: NextRequest) {
  /*
   * const scope = {
      activityName: suggestedActivity.activity.name,
      intervals:
        suggestedActivity.intervals ||
        [
          {
            constraintScores: suggestedActivity.constraintScores,
            interval: suggestedActivity.interval,
            score: suggestedActivity.score,
            slot: suggestedActivity.debug?.slot,
          },
        ].sort((a, b) => compareAsc(a.interval.start, b.interval.start)),
      constraints: suggestedActivity.activity.constraints,
    }
    *
    * return { explanation: ... }
   */

  // Parse the request body
  const body = await req.json()
  if (!body || !body.scope) {
    return Response.json(
      { error: 'Invalid request body. Expected a scope object.' },
      { status: 400 },
    )
  }

  const prompt = buildPrompt(body.scope)

  // Call the language model with the prompt
  const result = await generateText({
    model: 'amazon/nova-micro',
    prompt,
  })

  // Extract the raw messages from the response
  const rawMessages = result.response.messages
    .flatMap((message) => {
      const content = message.content as { text: string }[]
      return content.map((content) => content.text)
    })
    .join('\n')

  return Response.json({
    explanation: rawMessages
      .split('---')
      .map((message) => message.trim())
      .filter(Boolean),
  })
}

function buildPrompt(scope: any): string {
  return `Here is all the data for an activity:
  
  ${JSON.stringify(scope, null, 2)}
  
  The parts are:
  * activityName: The name of the activity
  * activityPriority: The priority of the activity, from 1 to 10, where 10 is the highest priority
  * constraints: rules that should match the input data in order for the activity to be valid
  * contexts: a list of independent contexts that the activity can be performed in.
  
  A context contains:
  * interval: the time period in which the activity can be performed
  * score: an average score for the context from 0 to 1, where 1 is the best score
  * constraintScores: the scores for each constraint type in the context
  * slot: all the input data for this interval
  
  The units in the data are:
  * Wind speed: m/s, but show knots in the explanation if relevant (multiply by 1.94384)
  * Tide height: m
  * Hour: unit, the hour of the day in UTC, this should be shown as a time, i.e. 0 is 00:00 UTC, 1 is 01:00 UTC, etc.
  * Precipitation: mm/h
  * Cloud cover: percentage
  * Temperature: Celsius
  * Precipitation probability: percentage
  
  Please provide a 2-3 sentence summary of why this activity has this score based only on the input data.
  Then give a concise explanation of the constraints that are met or not met in this context using bullet points.
  Any data values should be wrapped in backticks. The summary should be in italics.
  
  Do not use any external data or knowledge about the activity.
  Each context should be explained separately, and the explanations should be concise and to the point.
  
  All times are in UTC and should be shown in UTC.
  
  The audience is a user who is familiar with the activity and its constraints, but not with the specific data.
  The language should be simple and easy to understand. Use a friendly, colloquial, and helpful tone.
  
  Output each explanation in markdown format, with a line break (---) between each context's explanation.
  Do not include any additional text or formatting.
  Do not make reference to the format of the input data.
  `
}
