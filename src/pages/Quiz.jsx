import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge, Progress, Spinner, Input } from '../components/ui.jsx'
import { QUIZ_QUESTIONS, QUIZ_SCALE, RANK_LABELS } from '../data/quizQuestions.js'
import { SEED_LOCATION } from '../data/seedBallot.js'
import { scoreQuizLocally } from '../lib/localEngine.js'
import { saveProfile, saveLocation } from '../lib/session.js'
import { zipToState } from '../lib/zipToState.js'

export function Quiz() {
  const [step, setStep] = useState(-1) // -1 = location intro
  const [zip, setZip] = useState('')
  const [answers, setAnswers] = useState({})
  const [scoring, setScoring] = useState(false)
  const [openDraft, setOpenDraft] = useState('')
  const navigate = useNavigate()

  const question = QUIZ_QUESTIONS[step]
  const isOpenQuestion = question?.type === 'open'
  const progress = ((step + 1) / QUIZ_QUESTIONS.length) * 100

  useEffect(() => {
    if (QUIZ_QUESTIONS[step]?.type === 'open') {
      setOpenDraft(answers[QUIZ_QUESTIONS[step].id]?.answerLabel || '')
    }
  }, [step, answers])

  function parseOpenInput(text) {
    return text
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }

  function advance(next) {
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1)
      setOpenDraft('')
    } else {
      finish(next)
    }
  }

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
    advance(next)
  }

  function submitOpen(text) {
    const items = parseOpenInput(text)
    if (items.length === 0) return

    const next = {
      ...answers,
      [question.id]: {
        questionId: question.id,
        topic: question.topic,
        question: question.question,
        type: 'open',
        answer: items,
        answerLabel: items.join(', '),
      },
    }
    setAnswers(next)
    advance(next)
  }

  async function finish(answerMap) {
    setScoring(true)
    const answerList = Object.values(answerMap)
    const resolvedZip = zip || SEED_LOCATION.zip
    const resolvedState = zipToState(resolvedZip) || SEED_LOCATION.state
    // County isn't derivable from ZIP alone; only real for the seed location.
    const county = resolvedState === SEED_LOCATION.state ? SEED_LOCATION.county : null
    saveLocation({ zip: resolvedZip, state: resolvedState, county })

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
    navigate('/ballot')
  }

  if (scoring) {
    return (
      <Layout>
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
          }}
        >
          <Spinner size={32} />
          <p style={{ font: '430 var(--text-base) / 1.5 var(--font-sans)', color: 'var(--text-secondary)' }}>
            Matching candidates to your answers…
          </p>
        </div>
      </Layout>
    )
  }

  if (step === -1) {
    return (
      <Layout>
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
          }}
        >
          <Card style={{ width: '100%', maxWidth: 500, padding: 32 }}>
            <Badge tone="blue">Personalized quiz</Badge>
            <h1 style={{ margin: '16px 0 0', font: 'var(--weight-display) var(--text-xl) / 1.3 var(--font-display)' }}>
              First, where do you vote?
            </h1>
            <p style={{ margin: '10px 0 0', font: '430 var(--text-sm) / 1.6 var(--font-sans)', color: 'var(--text-secondary)' }}>
              You will rate eleven policy statements from 1 (strongly disagree) to 7 (strongly
              agree), then list any other priorities in your own words — separate multiple items
              with commas. Your ZIP helps locate the elections on your ballot.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setStep(0)
              }}
              style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'flex-end' }}
            >
              <Input
                label="ZIP code"
                mono
                type="text"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                placeholder="78701"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                style={{ width: 150 }}
                required
              />
              <Button type="submit" size="lg">
                Start quiz
              </Button>
            </form>
            <p style={{ margin: '16px 0 0', font: '430 var(--text-xs) / 1.5 var(--font-sans)', color: 'var(--text-faint)' }}>
              Demo uses Austin, TX (Travis County) ballot data regardless of ZIP.
            </p>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: 'var(--content-max)', width: '100%', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ font: '400 var(--text-sm) / 1.4 var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Question {step + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <Badge tone={question.topic?.startsWith('Local') ? 'green' : 'neutral'}>{question.topic}</Badge>
          </div>
          <Progress value={progress} />
        </div>

        {isOpenQuestion ? (
          <>
            <p style={{ margin: '0 0 12px', font: 'var(--weight-medium) var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
              Enter one or more priorities. Separate multiple answers with commas.
            </p>

            <h1 style={{ margin: '0 0 24px', font: 'var(--weight-display) var(--text-2xl) / 1.25 var(--font-display)' }}>
              {question.question}
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitOpen(openDraft)
              }}
            >
              <textarea
                rows={4}
                value={openDraft}
                onChange={(e) => setOpenDraft(e.target.value)}
                placeholder={question.placeholder}
                className="bb-input"
                style={{ resize: 'vertical', lineHeight: 1.55 }}
                required
              />
              {openDraft && parseOpenInput(openDraft).length > 1 && (
                <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {parseOpenInput(openDraft).map((item) => (
                    <li key={item}>
                      <Badge tone="blue">{item}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <Button type="submit" size="lg" style={{ marginTop: 24 }}>
                {step < QUIZ_QUESTIONS.length - 1 ? 'Continue' : 'Finish quiz'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 12px', font: 'var(--weight-medium) var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
              Rate how much you agree (1 = strongly disagree, 7 = strongly agree)
            </p>

            <h1 style={{ margin: '0 0 32px', font: 'var(--weight-display) var(--text-2xl) / 1.25 var(--font-display)' }}>
              {question.question}
            </h1>

            {/* Keyed by question so buttons remount — reused DOM nodes keep the
                previous question's focus/hover state and look pre-selected. */}
            <div className="bb-rank-grid" key={question.id}>
              {Array.from(
                { length: QUIZ_SCALE.max - QUIZ_SCALE.min + 1 },
                (_, i) => QUIZ_SCALE.min + i,
              ).map((rank) => {
                const selected = answers[question.id]?.answer === rank
                return (
                  <button
                    key={rank}
                    onClick={(e) => {
                      e.currentTarget.blur()
                      selectRank(rank)
                    }}
                    title={RANK_LABELS[rank - 1]}
                    aria-label={`${rank} — ${RANK_LABELS[rank - 1]}`}
                    className={`bb-rank ${selected ? 'bb-rank--selected' : ''}`}
                  >
                    <span className="bb-rank__num">{rank}</span>
                    <span className="bb-rank__label">{RANK_LABELS[rank - 1]}</span>
                  </button>
                )
              })}
            </div>
            <div className="bb-rank-ends" aria-hidden="true">
              <span>{RANK_LABELS[0]}</span>
              <span>{RANK_LABELS[RANK_LABELS.length - 1]}</span>
            </div>
          </>
        )}

        {step > 0 && (
          <Button
            variant="ghost"
            size="sm"
            style={{ marginTop: 32 }}
            onClick={() => {
              setStep(step - 1)
              setOpenDraft('')
            }}
          >
            ← Back
          </Button>
        )}
      </div>
    </Layout>
  )
}
