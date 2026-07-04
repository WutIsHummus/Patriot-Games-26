import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge, Progress, Spinner } from '../components/ui.jsx'
import { QUIZ_QUESTIONS, QUIZ_SCALE, RANK_LABELS } from '../data/quizQuestions.js'
import { SEED_LOCATION } from '../data/seedBallot.js'
import { scoreQuizLocally } from '../lib/localEngine.js'
import { saveProfile, saveLocation } from '../lib/session.js'

export function Quiz() {
  const [step, setStep] = useState(-1) // -1 = location intro
  const [zip, setZip] = useState('')
  const [answers, setAnswers] = useState({})
  const [scoring, setScoring] = useState(false)
  const navigate = useNavigate()

  const question = QUIZ_QUESTIONS[step]
  const progress = ((step + 1) / QUIZ_QUESTIONS.length) * 100

  function selectRank(rank) {
    const next = {
      ...answers,
      [question.id]: {
        questionId: question.id,
        topic: question.topic,
        question: question.question,
        answer: rank,
        answerLabel: RANK_LABELS[rank - 1],
      },
    }
    setAnswers(next)
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      finish(next)
    }
  }

  async function finish(answerMap) {
    setScoring(true)
    const answerList = Object.values(answerMap)
    saveLocation({ ...SEED_LOCATION, zip: zip || SEED_LOCATION.zip })

    // Prefer the server LLM scorer; fall back to the local engine when the
    // API key isn't configured or the request fails.
    let profile = null
    try {
      const res = await fetch('/api/scoring/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerList }),
      })
      const data = await res.json()
      if (data.ok) profile = data.profile
    } catch {
      // fall through to local scoring
    }
    if (!profile) profile = scoreQuizLocally(answerList)

    saveProfile({ ...profile, scoredAt: new Date().toISOString() })
    navigate('/results')
  }

  if (scoring) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
          <Spinner className="h-8 w-8" />
          <p className="text-slate-600">Building your political profile…</p>
        </div>
      </Layout>
    )
  }

  if (step === -1) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
          <Card className="w-full max-w-lg p-8">
            <Badge tone="indigo" className="mb-4">
              Personalized quiz
            </Badge>
            <h1 className="text-2xl font-bold text-slate-900">First, where do you vote?</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              You will rate ten policy statements from 1 (strongly disagree) to 7 (strongly agree).
              Your ZIP helps locate the elections on your ballot. You can retake the quiz anytime.
            </p>
            <form
              className="mt-6 flex gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                setStep(0)
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                placeholder="78701"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                className="w-40 rounded-lg border border-slate-300 px-3.5 py-2.5 text-lg tracking-widest shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
              <Button type="submit" size="lg">
                Start quiz
              </Button>
            </form>
            <p className="mt-4 text-xs text-slate-400">
              Demo uses Austin, TX (Travis County) ballot data regardless of ZIP.
            </p>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>
              Question {step + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <Badge tone="slate">{question.topic}</Badge>
          </div>
          <Progress value={progress} />
        </div>

        <p className="mb-3 text-sm font-medium text-slate-500">
          Rate how much you agree (1 = strongly disagree, 7 = strongly agree)
        </p>

        <h1 className="mb-8 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          {question.question}
        </h1>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from(
            { length: QUIZ_SCALE.max - QUIZ_SCALE.min + 1 },
            (_, i) => QUIZ_SCALE.min + i,
          ).map((rank) => {
            const selected = answers[question.id]?.answer === rank
            return (
              <button
                key={rank}
                onClick={() => selectRank(rank)}
                title={RANK_LABELS[rank - 1]}
                className={`flex flex-col items-center rounded-xl border px-1 py-3 transition-all hover:border-indigo-400 hover:shadow-sm sm:py-4 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="text-lg font-bold text-slate-900">{rank}</span>
                <span className="mt-1 hidden text-center text-[10px] leading-tight text-slate-500 sm:block">
                  {RANK_LABELS[rank - 1]}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-center text-xs text-slate-400 sm:hidden">
          {answers[question.id]
            ? RANK_LABELS[answers[question.id].answer - 1]
            : 'Tap a number to continue'}
        </p>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            ← Back
          </button>
        )}
      </div>
    </Layout>
  )
}
