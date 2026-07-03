import {
  CalendarDays,
  Code2,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

export const appConfig = {
  name: 'Hackathon',
  tagline: 'Build, validate, and demo your idea faster.',
  description:
    'A React boilerplate for shipping a polished hackathon website with routing, Tailwind styling, reusable sections, and deployment-ready scripts.',
  navItems: [
    { label: 'Features', href: '#features' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Stack', href: '#stack' },
  ],
}

export const stats = [
  { value: '48h', label: 'demo sprint' },
  { value: '7', label: 'starter sections' },
  { value: '0', label: 'backend required' },
]

export const features = [
  {
    icon: Rocket,
    title: 'Fast React setup',
    description:
      'Vite keeps local feedback quick so the team can focus on product decisions instead of tooling.',
  },
  {
    icon: Sparkles,
    title: 'Ready-made UI patterns',
    description:
      'Reusable cards, buttons, stats, and section headers help new screens stay consistent.',
  },
  {
    icon: ShieldCheck,
    title: 'Build-ready defaults',
    description:
      'Lint, production build, and preview scripts are included from the start.',
  },
]

export const roadmap = [
  {
    icon: Lightbulb,
    title: 'Shape the idea',
    description: 'Replace this copy with the problem, users, and winning angle.',
  },
  {
    icon: Code2,
    title: 'Build the core flow',
    description: 'Add routes, components, and API calls around the main demo path.',
  },
  {
    icon: CalendarDays,
    title: 'Practice the demo',
    description: 'Keep the first screen clear enough for judges to understand quickly.',
  },
]

export const stack = [
  'React',
  'Vite',
  'React Router',
  'Tailwind CSS',
  'Lucide Icons',
  'Oxlint',
]

export const team = [
  { icon: Users, label: 'Team-ready structure' },
  { icon: Code2, label: 'Component-first workflow' },
]
