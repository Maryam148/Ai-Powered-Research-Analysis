'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExplainerAnimation } from '@/components/auth/ExplainerAnimation'
import Image from 'next/image'
import '../auth.css'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setError(null)
    setSuccessMsg(null)
  }

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    resetForm()
    setActiveTab(tab)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      // Switch to login tab after successful signup
      setIsLoading(false)
      resetForm()
      setActiveTab('login')
      setError(null)
      setSuccessMsg('Account created! Please log in.')
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="hero-section min-h-screen">
      {/* Remove auth-bg-shapes to rely on hero-section background */}

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-6 lg:gap-10 max-w-[1400px] mx-auto">
        {/* Left Side — Explainer Animation (60%) */}
        <div className="w-full lg:w-[58%] flex flex-col items-center">
          <div className="text-center mb-6 lg:mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl tracking-wide" style={{ fontFamily: 'var(--font-bungee)', color: 'hsl(45, 100%, 50%)' }}>
                Research Flow
              </span>
            </Link>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-tight">
              Transform the Way
              <br />
              You Do Research
            </h1>
            <p className="mt-3 text-muted-foreground text-sm lg:text-base max-w-md mx-auto">
              Discover papers, visualize citations, generate insights — all in one flow.
            </p>
          </div>
          <div className="w-full max-w-[520px]">
            <ExplainerAnimation />
          </div>
        </div>

        {/* Right Side — Auth Card (40%) */}
        <div className="w-full lg:w-[38%] max-w-[440px]">
          <div className="glass-card p-8 lg:p-10">
            {/* Tab Switcher */}
            <div className="auth-tabs mb-8">
              <button
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('login')}
              >
                Log In
              </button>
              <button
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Error */}
            {error && <div className="auth-error mb-4">{error}</div>}

            {/* Success */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {successMsg}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleEmailLogin} className="form-enter space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="auth-checkbox-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <a href="#" className="auth-forgot">Forgot password?</a>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Log In'}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="form-enter space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Divider + Google */}
            <div className="mt-6 space-y-4">
              <div className="auth-divider">or continue with</div>

              <button className="auth-btn-google" onClick={handleGoogleAuth} disabled={isLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>

            {/* Bottom link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {activeTab === 'login' ? (
                <>Don&apos;t have an account?{' '}
                  <button onClick={() => handleTabSwitch('signup')} className="text-foreground font-medium hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => handleTabSwitch('login')} className="text-foreground font-medium hover:underline">
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
