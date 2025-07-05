export default function DateDisplay() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }

  return (
    <h2 className="font-mono text-4xl mb-8">
      {tomorrow.toLocaleDateString('en-GB', options)}
    </h2>
  )
}
