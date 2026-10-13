import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Orbit,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react'
import { supabase, supabaseReady } from './lib/supabase'

function Atmosphere() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const core = new THREE.Group()
    scene.add(core)

    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4b6a0,
      emissive: 0x573b68,
      emissiveIntensity: 0.65,
      metalness: 0.28,
      roughness: 0.62,
      wireframe: true,
      transparent: true,
      opacity: 0.82,
    })
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.55, 0.24, 240, 18, 2, 3), knotMaterial)
    core.add(knot)

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.88, 3),
      new THREE.MeshBasicMaterial({ color: 0xb5e3d8, wireframe: false, transparent: true, opacity: 0.42 }),
    )
    core.add(inner)

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xe9c8a7,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      wireframe: true,
    })
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.006, 3, 180), haloMaterial)
    halo.rotation.set(0.8, 0.25, -0.5)
    core.add(halo)

    const haloTwo = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.004, 3, 180), haloMaterial.clone())
    haloTwo.rotation.set(1.3, -0.55, 0.7)
    haloTwo.scale.set(0.8, 1.2, 1)
    core.add(haloTwo)

    // Surreal dream objects: an impossible moon and a suspended, liquid-like pearl.
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0xf0d9bd, roughness: 0.88, metalness: 0.02 })
    )
    moon.position.set(2.35, 1.55, -1.8)
    scene.add(moon)

    const moonHalo = new THREE.Mesh(
      new THREE.TorusGeometry(1.03, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({ color: 0xe9c8a7, transparent: true, opacity: 0.72 })
    )
    moonHalo.position.copy(moon.position)
    moonHalo.rotation.set(1.0, 0.2, -0.3)
    scene.add(moonHalo)

    const pearl = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 48, 48),
      new THREE.MeshPhysicalMaterial({ color: 0xb5e3d8, roughness: 0.12, metalness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 })
    )
    pearl.position.set(-2.55, -1.3, 0.4)
    scene.add(pearl)

    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.68, 0),
      new THREE.MeshStandardMaterial({ color: 0x8e719f, roughness: 0.48, metalness: 0.2, flatShading: true })
    )
    shard.position.set(2.55, -1.55, -0.3)
    shard.rotation.set(0.4, 0.2, 0.6)
    scene.add(shard)

    const floatingRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.035, 12, 96),
      new THREE.MeshStandardMaterial({ color: 0xb5e3d8, metalness: 0.62, roughness: 0.25 })
    )
    floatingRing.position.set(-2.4, 1.55, -1.2)
    floatingRing.rotation.set(0.9, 0.1, 0.4)
    scene.add(floatingRing)

    const starCount = 1500
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 24
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 16
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2
      const cyan = Math.random() > 0.72
      starColors[i * 3] = cyan ? 0.36 : 0.62
      starColors[i * 3 + 1] = cyan ? 0.91 : 0.54
      starColors[i * 3 + 2] = 1
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, opacity: 0.82, sizeAttenuation: true }),
    )
    scene.add(stars)

    scene.add(new THREE.AmbientLight(0xaaa0c8, 1.8))
    const keyLight = new THREE.PointLight(0xe9c8a7, 30, 22)
    keyLight.position.set(3, 2, 5)
    scene.add(keyLight)
    const rimLight = new THREE.PointLight(0x8adbc9, 22, 18)
    rimLight.position.set(-4, -2, 3)
    scene.add(rimLight)

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth
      const height = mount.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.position.x = width < 700 ? 0.1 : 0.7
      camera.position.z = width < 700 ? 11 : 10
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    resize()
    window.addEventListener('resize', resize)
    let frame = 0
    let pointerX = 0
    let pointerY = 0
    const onPointerMove = (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 0.45
      pointerY = (event.clientY / window.innerHeight - 0.5) * 0.35
    }
    window.addEventListener('pointermove', onPointerMove)

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const time = performance.now() * 0.00018
      knot.rotation.x = time * 0.28 + pointerY
      knot.rotation.y = time * 0.42 + pointerX
      inner.rotation.x = -time * 0.32
      inner.rotation.y = time * 0.22
      halo.rotation.z = time * 0.18
      haloTwo.rotation.x = time * 0.14
      moon.position.y = 1.55 + Math.sin(time * 2.2) * 0.12
      moon.rotation.y = time * 0.08
      moonHalo.rotation.z = -time * 0.1
      pearl.position.y = -1.3 + Math.sin(time * 2.8 + 1) * 0.24
      pearl.rotation.y = time * 0.22
      shard.rotation.x = 0.4 + Math.sin(time * 1.6) * 0.18
      shard.rotation.y = time * 0.24
      floatingRing.rotation.y = 0.1 + time * 0.2
      floatingRing.rotation.z = 0.4 + Math.sin(time * 1.2) * 0.12
      core.rotation.y += (pointerX - core.rotation.y) * 0.012
      core.rotation.x += (pointerY - core.rotation.x) * 0.012
      stars.rotation.y = time * 0.07
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else object.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="atmosphere" ref={mountRef} aria-hidden="true" />
}

function PasswordField({ value, onChange, visible, setVisible, autoComplete = 'current-password' }) {
  return (
    <div className="password-wrap">
      <LockKeyhole size={17} aria-hidden="true" />
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="At least 8 characters"
        autoComplete={autoComplete}
        minLength={8}
        required
      />
      <button className="visibility-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [apiStatus, setApiStatus] = useState('idle')
  const [recoveryFlow, setRecoveryFlow] = useState(false)

  const verifyBackend = async (session) => {
    if (!session?.access_token) {
      setApiStatus('idle')
      return
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!response.ok) throw new Error('API verification failed')
      setApiStatus('verified')
    } catch {
      setApiStatus('unavailable')
    }
  }

  useEffect(() => {
    if (!supabaseReady) {
      setBooting(false)
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setBooting(false)
      verifyBackend(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryFlow(true)
        setMode('update-password')
      }
      setUser(session?.user ?? null)
      verifyBackend(session)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const strength = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }, [password])

  const clearNotice = () => setNotice(null)

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setNotice(null)
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const friendlyError = (message) => {
    const value = message?.toLowerCase() ?? ''
    if (value.includes('invalid login credentials')) return 'That email and password do not match. Give it another try.'
    if (value.includes('already registered') || value.includes('user already registered')) return 'An account with this email already exists. Try signing in instead.'
    if (value.includes('password should be at least')) return 'Your password needs at least 8 characters.'
    if (value.includes('email not confirmed')) return 'Your email still needs to be verified. Check your inbox for the confirmation link.'
    if (value.includes('rate limit') || value.includes('too many requests')) return 'A few too many attempts. Take a breath and try again shortly.'
    if (value.includes('fetch') || value.includes('network')) return 'Could not reach the authentication service. Check your connection and try again.'
    return message || 'Something unexpected happened. Please try again.'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearNotice()

    if (!supabaseReady) {
      setNotice({ type: 'error', text: 'Supabase is not connected yet. Add your project URL and anon key to frontend/.env.' })
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setNotice({ type: 'error', text: 'Those passwords do not match yet.' })
        return
      }
      if (password.length < 8) {
        setNotice({ type: 'error', text: 'Choose a password with at least 8 characters.' })
        return
      }
      if (!accepted) {
        setNotice({ type: 'error', text: 'Please accept the terms before creating your account.' })
        return
      }
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        if (data.session) {
          setNotice({ type: 'success', text: 'Your account is ready. Welcome to Hypervision.' })
        } else {
          setNotice({ type: 'success', text: 'You’re almost in. Check your inbox for a verification link to activate your account.' })
        }
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        setNotice({ type: 'success', text: 'You’re back. Welcome through the portal.' })
      } else if (mode === 'update-password') {
        if (password !== confirmPassword) throw new Error('Those passwords do not match yet.')
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setRecoveryFlow(false)
        await supabase.auth.signOut()
        setUser(null)
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setNotice({ type: 'success', text: 'Your password has been updated. Sign in with your new password.' })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setNotice({ type: 'success', text: 'If an account exists for that email, a password reset link is on its way.' })
      }
    } catch (error) {
      setNotice({ type: 'error', text: friendlyError(error.message) })
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    setBusy(false)
    if (error) setNotice({ type: 'error', text: friendlyError(error.message) })
    else {
      setNotice({ type: 'success', text: 'Signed out safely. The portal will be here when you return.' })
      setMode('login')
    }
  }

  if (booting) {
    return (
      <main className="loading-screen">
        <div className="loading-mark"><Orbit size={28} /></div>
        <span>Aligning the stars</span>
      </main>
    )
  }

  if (user && !recoveryFlow) {
    return (
      <main className="portal-shell">
        <Atmosphere />
        <div className="portal-topbar">
          <a className="wordmark" href="/" aria-label="Hypervision home"><span className="brand-symbol"><Orbit size={22} /></span>HYPERVISION<span className="brand-period">.</span></a>
        </div>
        <section className="welcome-card">
          <div className="welcome-icon"><Fingerprint size={32} /></div>
          <span className="eyebrow">IDENTITY VERIFIED · 001</span>
          <h1>You’re <span>in.</span></h1>
          <p>Your next dimension is waiting, {user.user_metadata?.display_name || user.email?.split('@')[0] || 'traveller'}.</p>
          <div className="identity-row"><div className="identity-avatar">{(user.email || 'H').charAt(0).toUpperCase()}</div><div><span>AUTHENTICATED AS</span><strong>{user.email}</strong></div><ShieldCheck size={20} className="identity-check" /></div>
          <div className={`api-status ${apiStatus}`}><span />{apiStatus === 'verified' ? 'PYTHON API · IDENTITY VERIFIED' : apiStatus === 'unavailable' ? 'PYTHON API · OFFLINE, AUTH STILL ACTIVE' : 'CHECKING IDENTITY SERVICE'}</div>
          <button className="submit-button" type="button" onClick={signOut} disabled={busy}>{busy ? 'Closing session…' : 'Sign out securely'} <ArrowRight size={17} /></button>
          {notice && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}
        </section>
      </main>
    )
  }

  const isSignup = mode === 'signup'
  const isReset = mode === 'reset'
  const isUpdatePassword = mode === 'update-password'

  return (
    <main className={`auth-shell mode-${mode === 'signup' ? 'signup' : 'login'}`}>
      <Atmosphere />
      <div className="ambient-glow ambient-one" />
      <div className="ambient-glow ambient-two" />

      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Hypervision home">
          <span className="brand-symbol"><Orbit size={22} strokeWidth={1.8} /></span>
          HYPERVISION<span className="brand-period">.</span>
        </a>
        <div className="topbar-right">
          <span className="system-status"><span /> A QUIETER KIND OF ELSEWHERE</span>
        </div>
      </header>

      <div className="layout-grid">
        <section className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> THE FUTURE IS A PLACE</div>
            <h1>Step beyond<br />the <span className="gradient-word">ordinary.</span></h1>
            <p className="hero-description">A new perspective. A different frequency. Everything you’re about to become starts with a single step.</p>
            <div className="hero-cta">
              <span className="cta-orbit"><ArrowDownRight size={18} /></span>
              <div><strong>Step into the strange.</strong><span>A little less ordinary, a little more you.</span></div>
            </div>
          </div>

          <div className="brutal-art" aria-hidden="true">
            <div className="art-sun"></div>
            <div className="art-slab art-slab-orange"></div>
            <div className="art-slab art-slab-lime"></div>
            <div className="art-ring"></div>
            <div className="art-cross">✳</div>
          </div>


        </section>

        <section className="form-side">
          <div className="form-card" key={mode}>
            <div className="form-card-top">
              <div className="form-icon"><Sparkles size={19} /></div>
              <span className="form-step">{isReset ? 'PASSWORD RESET' : isSignup ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
            </div>

            <div className="form-heading">
              <h2>{isReset ? 'Find your way back.' : isUpdatePassword ? 'Choose a new key.' : isSignup ? 'Create your orbit.' : 'Welcome back.'}</h2>
              <p>{isReset ? 'We’ll send a secure link to reset your password.' : isUpdatePassword ? 'Set a new password for your Hypervision identity.' : isSignup ? 'You were never meant to stay ordinary.' : 'Your place in the universe is still here.'}</p>
            </div>

            {!isReset && !isUpdatePassword && (
              <div className="mode-switch" role="tablist" aria-label="Authentication mode">
                <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => changeMode('signup')}>Create account</button>
                <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => changeMode('login')}>Sign in</button>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="field-group">
                  <span className="field-label">YOUR NAME</span>
                  <div className="input-wrap"><UserRound size={17} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" autoComplete="name" minLength={2} required /></div>
                </label>
              )}

              <label className="field-group">
                <span className="field-label">EMAIL ADDRESS</span>
                <div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@somewhere.com" autoComplete="email" required /></div>
              </label>

              {!isReset && (
                <label className="field-group">
                  <span className="field-label">{isUpdatePassword ? 'NEW PASSWORD' : 'PASSWORD'} <span className="field-hint">{isSignup || isUpdatePassword ? 'MIN. 8 CHARACTERS' : <button type="button" className="text-button" onClick={() => changeMode('reset')}>Forgot password?</button>}</span></span>
                  <PasswordField value={password} onChange={setPassword} visible={showPassword} setVisible={setShowPassword} autoComplete={isSignup ? 'new-password' : 'current-password'} />
                  {isSignup && password.length > 0 && (
                    <div className="strength-meter" aria-label={`Password strength ${strength} out of 4`}>
                      <div className="strength-track">{[1, 2, 3, 4].map((item) => <i key={item} className={strength >= item ? `filled strength-${strength}` : ''} />)}</div>
                      <span>{['', 'Getting there', 'Fair', 'Strong', 'Excellent'][strength]}</span>
                    </div>
                  )}
                </label>
              )}

              {(isSignup || isUpdatePassword) && (
                <label className="field-group">
                  <span className="field-label">CONFIRM PASSWORD</span>
                  <PasswordField value={confirmPassword} onChange={setConfirmPassword} visible={showConfirmPassword} setVisible={setShowConfirmPassword} autoComplete="new-password" />
                </label>
              )}

              {isSignup && (
                <label className="terms-check">
                  <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                  <span className="custom-check"><Check size={12} /></span>
                  <span>I agree to the <a href="https://supabase.com/terms" target="_blank" rel="noreferrer">terms of service</a> and understand the privacy policy.</span>
                </label>
              )}

              {notice && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}

              <button className="submit-button" type="submit" disabled={busy}>
                <span>{busy ? (isReset ? 'Sending secure link…' : isSignup ? 'Creating your orbit…' : 'Opening the portal…') : isReset ? 'Send reset link' : isSignup ? 'Create my account' : 'Enter Hypervision'}</span>
                {busy ? <span className="button-spinner" /> : <ArrowRight size={18} />}
              </button>
            </form>

            {isReset || isUpdatePassword ? (
              <button className="back-link" type="button" onClick={() => { setRecoveryFlow(false); changeMode('login') }}><ArrowLeft size={15} /> Back to sign in</button>
            ) : (
              <div className="switch-prompt">
                <span>{isSignup ? 'Already have a place here?' : 'New to this universe?'}</span>
                <button type="button" onClick={() => changeMode(isSignup ? 'login' : 'signup')}>{isSignup ? 'Sign in instead' : 'Create an account'} <ChevronRight size={14} /></button>
              </div>
            )}

            <div className="card-foot"><ShieldCheck size={14} /><span>ENCRYPTED CONNECTION</span><span className="foot-divider" /><span>YOUR DATA, YOURS</span></div>
          </div>
          <div className="form-side-note"><Zap size={13} /><span>Designed for the next version of you.</span></div>
        </section>
      </div>

      {!supabaseReady && <div className="setup-pill"><span /> Authentication setup required</div>}
    </main>
  )
}

export default App
