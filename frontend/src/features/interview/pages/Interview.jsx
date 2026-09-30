import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import '../style/interview.scss'
import gsap from 'gsap'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── In-place Skeleton Component (No Full-Page Loader) ─────────────────────────
const InterviewSkeleton = () => (
    <div className='interview-page'>
        <div className='interview-layout'>
            <nav className='interview-nav'>
                <div className='nav-content'>
                    <div className='skeleton-shimmer' style={{ width: '100px', height: '18px', marginBottom: '1.5rem' }} />
                    <div className='skeleton-shimmer' style={{ width: '100%', height: '42px', marginBottom: '0.65rem' }} />
                    <div className='skeleton-shimmer' style={{ width: '100%', height: '42px', marginBottom: '0.65rem' }} />
                    <div className='skeleton-shimmer' style={{ width: '100%', height: '42px' }} />
                </div>
                <div className='skeleton-shimmer' style={{ width: '100%', height: '40px' }} />
            </nav>

            <div className='interview-divider' />

            <main className='interview-content'>
                <div className='content-header'>
                    <div className='skeleton-shimmer' style={{ width: '220px', height: '28px' }} />
                    <div className='skeleton-shimmer' style={{ width: '80px', height: '24px', borderRadius: '99px' }} />
                </div>
                <div className='q-list'>
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className='skeleton-shimmer skeleton-card' style={{ marginBottom: '0.85rem' }} />
                    ))}
                </div>
            </main>

            <div className='interview-divider' />

            <aside className='interview-sidebar'>
                <div className='match-score'>
                    <div className='skeleton-shimmer' style={{ width: '90px', height: '14px', alignSelf: 'flex-start' }} />
                    <div className='skeleton-shimmer skeleton-ring' style={{ margin: '1rem 0' }} />
                    <div className='skeleton-shimmer' style={{ width: '130px', height: '14px' }} />
                </div>
                <div className='sidebar-divider' />
                <div className='skill-gaps'>
                    <div className='skeleton-shimmer' style={{ width: '80px', height: '14px' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className='skeleton-shimmer' style={{ width: '70px', height: '26px' }} />
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    </div>
)

// ── Question Card with Smooth Expand ──────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    const bodyRef = useRef(null)

    useEffect(() => {
        if (open && bodyRef.current) {
            gsap.fromTo(
                bodyRef.current,
                { opacity: 0, y: -6 },
                { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
            )
        }
    }, [open])

    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body' ref={bodyRef}>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Interviewer Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer &amp; Key Points</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Road Map Day ──────────────────────────────────────────────────────────────
const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    <span>{task}</span>
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const [ displayScore, setDisplayScore ] = useState(0)
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    const contentRef = useRef(null)
    const gaugeRef = useRef(null)

    useEffect(() => {
        if (!interviewId) return
        getReportById(interviewId)
    }, [interviewId, getReportById])

    // Animated score counter & SVG circular gauge via GSAP
    useEffect(() => {
        if (!report?.matchScore) return

        const targetScore = report.matchScore
        const counter = { val: 0 }

        gsap.to(counter, {
            val: targetScore,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => setDisplayScore(Math.round(counter.val))
        })

        if (gaugeRef.current) {
            const radius = 45
            const circumference = 2 * Math.PI * radius // ~282.74
            const offset = circumference - (circumference * targetScore) / 100

            gsap.fromTo(
                gaugeRef.current,
                { strokeDashoffset: circumference },
                { strokeDashoffset: offset, duration: 1.2, ease: "power2.out" }
            )
        }
    }, [report?.matchScore])

    // Smooth transition on switching navigation tabs
    const handleNavSwitch = (navId) => {
        if (activeNav === navId) return
        setActiveNav(navId)
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
            )
        }
    }

    if (loading || !report) {
        return <InterviewSkeleton />
    }

    const scoreClass =
        report.matchScore >= 80 ? 'score--high' :
        report.matchScore >= 60 ? 'score--mid' : 'score--low'

    const meterClass =
        report.matchScore >= 80 ? 'meter--high' :
        report.matchScore >= 60 ? 'meter--mid' : 'meter--low'

    const radius = 45
    const circumference = 2 * Math.PI * radius

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <Link to="/" className="nav-back-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                            <span>Back to Plan Creator</span>
                        </Link>
                        <p className='interview-nav__label'>Preparation Areas</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => handleNavSwitch(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { getResumePdf(interviewId) }}
                        className='button primary-button'
                        title="Download AI-tailored resume PDF"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>Download Tailored Resume</span>
                    </button>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content' ref={contentRef}>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Interview Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} Questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} Questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Day-by-Day Preparation Plan</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-Day Roadmap</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Circular Match Score Gauge */}
                    <div className='match-score'>
                        <p className='match-score__label'>Candidate Match</p>
                        <div className='match-score__gauge-wrap'>
                            <svg width="110" height="110">
                                <circle
                                    className="gauge-bg"
                                    cx="55"
                                    cy="55"
                                    r={radius}
                                />
                                <circle
                                    ref={gaugeRef}
                                    className={`gauge-meter ${meterClass}`}
                                    cx="55"
                                    cy="55"
                                    r={radius}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference}
                                />
                            </svg>
                            <div className='match-score__center'>
                                <span className='match-score__value'>{displayScore}</span>
                                <span className='match-score__pct'>%</span>
                            </div>
                        </div>
                        <p className={`match-score__sub ${scoreClass}`}>
                            {report.matchScore >= 80 ? 'Strong Match for Role' : report.matchScore >= 60 ? 'Moderate Match for Role' : 'Skill Alignment Needed'}
                        </p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Identified Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`} title={`Severity: ${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview
