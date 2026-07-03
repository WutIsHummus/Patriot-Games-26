export function StatCard({ label, value }) {
  return (
    <div className="border-l border-slate-200 pl-5">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}
