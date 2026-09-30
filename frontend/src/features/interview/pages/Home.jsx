import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import "../style/home.scss"
import gsap from 'gsap'

const GENERATION_PHASES = [
    "Analyzing profile & resume signals...",
    "Benchmarking requirements against target role...",
    "Formulating targeted technical questions...",
    "Synthesizing behavioral scenarios & model answers...",
    "Structuring step-by-step preparation roadmap..."
]

const Home = () => {
    const { loading, generateReport, reports, getReports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ errors, setErrors ] = useState({})
    const [ phaseIndex, setPhaseIndex ] = useState(0)
    
    const resumeInputRef = useRef(null)
    const headerRef = useRef(null)
    const cardRef = useRef(null)
    const recentRef = useRef(null)
    const dropzoneRef = useRef(null)

    const navigate = useNavigate()

    useEffect(() => {
        getReports()
    }, [getReports])

    // GSAP page entrance animation
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

        if (headerRef.current) {
            tl.fromTo(headerRef.current, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.7 })
        }
        if (cardRef.current) {
            tl.fromTo(cardRef.current, { opacity: 0, y: 28, scale: 0.99 }, { opacity: 1, y: 0, scale: 1, duration: 0.75 }, "-=0.4")
        }
        if (recentRef.current) {
            tl.fromTo(recentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        }
    }, [])

    // Animate recent reports when they load
    useEffect(() => {
        if (reports.length > 0) {
            gsap.fromTo(
                ".report-item",
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
            )
        }
    }, [reports.length])

    // Cycle through descriptive generation phases during loading (in-place, no full-page loader)
    useEffect(() => {
        if (!loading) {
            setPhaseIndex(0)
            return
        }
        const interval = setInterval(() => {
            setPhaseIndex(prev => (prev + 1) % GENERATION_PHASES.length)
        }, 3200)
        return () => clearInterval(interval)
    }, [loading])

    const validateAndSetFile = (file) => {
        if (!file) {
            setResumeFile(null)
            return
        }

        const allowedExtensions = ['.pdf', '.docx']
        const allowedMimeTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/docx',
            'application/msword',
            'application/octet-stream'
        ]

        const fileName = file.name || ''
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()

        const hasValidExt = allowedExtensions.includes(extension)
        const hasValidMime = file.type ? allowedMimeTypes.includes(file.type) : true

        if (!hasValidExt || !hasValidMime) {
            setErrors(prev => ({ ...prev, resume: "Only PDF or DOCX files are allowed" }))
            setResumeFile(null)
            if (resumeInputRef.current) resumeInputRef.current.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setErrors(prev => ({ ...prev, resume: "File size must be less than 5MB" }))
            setResumeFile(null)
            if (resumeInputRef.current) resumeInputRef.current.value = ''
            return
        }

        setErrors(prev => ({ ...prev, resume: undefined, selfDescription: undefined }))
        setResumeFile(file)

        // Haptic-style subtle GSAP bounce feedback on file attach
        if (dropzoneRef.current) {
            gsap.fromTo(dropzoneRef.current, { scale: 0.98 }, { scale: 1, duration: 0.35, ease: "back.out(2)" })
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        validateAndSetFile(file)
    }

    const handleRemoveFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setResumeFile(null)
        if (resumeInputRef.current) resumeInputRef.current.value = ''
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer?.files?.[0]
        if (file) {
            validateAndSetFile(file)
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!jobDescription.trim()) newErrors.jobDescription = "Job description is required"
        if (!selfDescription.trim() && !resumeFile) {
            newErrors.selfDescription = "Either self-description or resume is required"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleGenerateReport = async () => {
        if (!validateForm() || loading) return
        try {
            const data = await generateReport({
                jobDescription: jobDescription.trim(),
                selfDescription: selfDescription.trim(),
                resumeFile: resumeFile || null
            })
            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            }
        } catch {
            setErrors(prev => ({ ...prev, general: "Failed to generate report. Please try again." }))
        }
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header' ref={headerRef}>
                <h1>Build Your Custom <span className='highlight'>Interview Strategy</span></h1>
                <p>Advanced AI evaluates role requirements, highlights critical skill gaps, and prepares questions tailored to your background.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card' ref={cardRef}>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            disabled={loading}
                            placeholder={`Paste the job description here...\ne.g. 'Senior Frontend Engineer requires proficiency in React, TypeScript, state management, and large-scale web performance...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                        {errors.jobDescription && <span className="error">{errors.jobDescription}</span>}
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Candidate Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label
                                ref={dropzoneRef}
                                className={`dropzone ${resumeFile ? 'dropzone--has-file' : ''}`}
                                htmlFor='resume'
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <span className='dropzone__icon'>
                                    {resumeFile ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                                {resumeFile ? (
                                    <>
                                        <p className='dropzone__title'>{resumeFile.name}</p>
                                        <p className='dropzone__subtitle'>
                                            {resumeFile.size < 1024 * 1024
                                                ? `${(resumeFile.size / 1024).toFixed(1)} KB`
                                                : `${(resumeFile.size / (1024 * 1024)).toFixed(2)} MB`} • Click to replace file
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                    </>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    disabled={loading}
                                    accept='.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                    onChange={handleFileChange}
                                />
                            </label>
                            {resumeFile && (
                                <button
                                    type='button'
                                    disabled={loading}
                                    className='dropzone__remove-btn'
                                    onClick={handleRemoveFile}
                                >
                                    Remove selected file
                                </button>
                            )}
                            {errors.resume && <span className="error">{errors.resume}</span>}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                disabled={loading}
                                className='panel__textarea panel__textarea--short'
                                placeholder="Brief summary of your stack, years of experience, or main achievements if you don't have a resume handy..."
                            />
                        </div>
                        {errors.selfDescription && <span className="error">{errors.selfDescription}</span>}

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#080b12" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#080b12" strokeWidth="2" /></svg>
                            </span>
                            <p>Provide either your <strong>Resume</strong> or a <strong>Self Description</strong> for personalized analysis.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer with Inline Progress when Loading */}
                <div className='interview-card__footer'>
                    {loading && (
                        <div className='generation-status-box'>
                            <div className='status-text-row'>
                                <span className='status-phase'>
                                    <svg className='btn-spinner' width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                                    {GENERATION_PHASES[phaseIndex]}
                                </span>
                                <span>AI Processing</span>
                            </div>
                            <div className='progress-track'>
                                <div className='progress-bar' />
                            </div>
                        </div>
                    )}

                    <div className='footer-bottom'>
                        <div className='footer-info'>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>Generates full technical &amp; behavioral breakdown in ~15s</span>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className='generate-btn'
                        >
                            {loading ? (
                                <>
                                    <div className='btn-spinner' />
                                    <span>Synthesizing Strategy...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                                    <span>Generate Interview Strategy</span>
                                </>
                            )}
                        </button>
                    </div>
                    {errors.general && <p className="error" style={{ textAlign: "right" }}>{errors.general}</p>}
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports' ref={recentRef}>
                    <h2>Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Interview AI Platform</a>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
            </footer>
        </div>
    )
}

export default Home