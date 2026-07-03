export function FeatureCard({ description, icon: Icon, title }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  )
}
