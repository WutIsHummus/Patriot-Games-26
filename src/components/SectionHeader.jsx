export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </div>
  )
}
