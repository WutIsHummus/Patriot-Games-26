import { ExternalLink } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { FeatureCard } from '../components/FeatureCard.jsx'
import { SectionHeader } from '../components/SectionHeader.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { appConfig, features, roadmap, stack, stats, team } from '../data/site.js'

export function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3 font-bold text-slate-950">
            <span className="flex size-9 items-center justify-center rounded-md bg-emerald-600 text-white">
              H
            </span>
            {appConfig.name}
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {appConfig.navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="https://github.com/WutIsHummus/Hackathon"
            className="inline-flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            aria-label="Open GitHub repository"
          >
            <ExternalLink className="size-5" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
            Hackathon starter kit
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            {appConfig.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {appConfig.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#features">Explore boilerplate</Button>
            <Button href="https://vite.dev/guide/" variant="secondary">
              Vite docs
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <div className="rounded-md border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="mb-4 flex gap-2">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-amber-400" />
              <span className="size-3 rounded-full bg-emerald-400" />
            </div>
            <div className="grid gap-3">
              <div className="rounded-md bg-white/10 p-4">
                <p className="text-sm text-slate-300">Current focus</p>
                <p className="mt-2 text-xl font-semibold">Ship the demo flow</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {team.map((item) => (
                  <div key={item.label} className="rounded-md bg-white p-4 text-slate-950">
                    <item.icon className="mb-3 size-5 text-emerald-600" aria-hidden="true" />
                    <p className="text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md bg-emerald-500 p-4 text-slate-950">
                <p className="text-sm font-semibold">Next step</p>
                <p className="mt-1 text-sm">Swap in your product copy and start building routes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Boilerplate"
            title="Everything needed for a fast first version"
            description="Start from this structure, then replace the sample content with your hackathon product screens."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Workflow"
            title="A simple path from idea to demo"
            description="Keep the starter focused on the story judges need to understand first."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {roadmap.map((item, index) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <span className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <item.icon className="size-5 text-emerald-700" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Tech stack
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Lightweight tools for fast teams
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
