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
  const rawMessages = result.response.messages.flatMap((message) => {
    const content = message.content as { text: string }[]
    return content.map((content) => content.text)
  })

  return Response.json({
    explanation: rawMessages.join('||||'),
  })
}

function buildPrompt(scope: any): string {
  return `Explain the activity "${scope.activityName}" with the following details: ${JSON.stringify(scope, null, 2)}`
}
