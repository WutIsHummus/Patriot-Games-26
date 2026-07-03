import { ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils.js'

export function Button({ children, className, icon = true, variant = 'primary', ...props }) {
  return (
    <a
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        variant === 'primary' &&
          'bg-slate-950 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-slate-950',
        variant === 'secondary' &&
          'border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-slate-500',
        className,
      )}
      {...props}
    >
      {children}
      {icon ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
    </a>
  )
}
