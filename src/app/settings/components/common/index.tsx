export function SettingTitle({ title }: { title: string }) {
  return (
    <h1 className="bg-base-100 sticky top-10 p-2 px-4 text-2xl font-bold">
      {title}
    </h1>
  )
}

type SettingCardProps = {
  title?: string
  buttons?: React.ReactNode
  children?: React.ReactNode
}
export function SettingCard({ title, buttons, children }: SettingCardProps) {
  return (
    <div className="card card-lg my-2 shadow-sm">
      <div className="card-body">
        {(title || buttons) && (
          <div className="card-title flex flex-row justify-between">
            {title && (
              <div className="flex-1">
                <div className="text-lg">{title}</div>
              </div>
            )}
            {buttons}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
