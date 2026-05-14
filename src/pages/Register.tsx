import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.scss';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: '',
    email: '',
    password: '',
    promo: '',
    agree: true,
  });
  const [showPromo, setShowPromo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');

  const validateEmail = (email: string) => {
    // Must be a real email format
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleSendOtp = async () => {
    setError('');
    if (!validatePhone(form.phone)) {
      setError('Enter valid 10-digit Indian mobile number'); return;
    }
    if (!validateEmail(form.email)) {
      setError('Enter a valid email address'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    if (!form.agree) {
      setError('Please accept the user agreement'); return;
    }
    // Simulate OTP (in production, send via SMS API like Twilio/Fast2SMS)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(generatedOtp);
    console.log(`[DEV] OTP for ${form.phone}: ${generatedOtp}`); // remove in production
    setStep('verify');
  };

  const handleVerifyAndRegister = async () => {
    if (otp !== sentOtp) {
      setError('Invalid OTP. Please try again.'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.phone, // use phone as username
          email: form.email,
          password: form.password,
          mobile: form.phone,
          promo: form.promo,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      localStorage.setItem('aviator_token', data.token);
      localStorage.setItem('aviator_user', JSON.stringify(data.user));
      navigate(`/?cert=${data.token}`);
    } catch {
      setError('Connection failed. Make sure backend is running.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // In production: integrate Google OAuth
    // For now redirect to manual login
    alert('Google login coming soon! Please use email registration for now.');
  };

  const handleTelegramLogin = () => {
    window.open('https://t.me/yourbotusername', '_blank');
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        {/* Close button */}
        <Link to="/login" className="auth-modal-close">×</Link>

        <h2 className="auth-modal-title">Registration</h2>

        {step === 'form' ? (
          <>
            {/* Currency selector */}
            <div className="auth-select-row">
              <div className="auth-currency-select">
                <span className="currency-flag">🇮🇳</span>
                <span>INR</span>
                <span>Indian rupee</span>
                <span className="select-arrow">▼</span>
              </div>
            </div>

            {/* Phone number */}
            <div className="auth-phone-row">
              <div className="auth-country-code">
                <span>🇮🇳</span>
                <span>▼</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                placeholder="00000 00000"
                value={form.phone}
                maxLength={10}
                onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                className="auth-phone-input"
              />
            </div>

            {/* Email */}
            <div className="auth-field">
              <span className="auth-field-icon">✉️</span>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <span className="auth-field-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="auth-hint">At least 8 characters</div>

            {/* Promo code */}
            <div className="auth-promo-toggle" onClick={() => setShowPromo(!showPromo)}>
              + Add promo code
            </div>
            {showPromo && (
              <div className="auth-field">
                <span className="auth-field-icon">🎁</span>
                <input
                  type="text"
                  placeholder="Promo code (optional)"
                  value={form.promo}
                  onChange={e => setForm({ ...form, promo: e.target.value })}
                />
              </div>
            )}

            {/* Agreement */}
            <label className="auth-agree">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={e => setForm({ ...form, agree: e.target.checked })}
              />
              <span>By clicking "Register", I accept <a href="#">the user agreement</a></span>
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-btn-green" onClick={handleSendOtp}>
              Register
            </button>

            {/* Divider */}
            <div className="auth-divider"><span>or</span></div>

            {/* Social logins */}
            <div className="auth-social-row">
              <button className="auth-social-btn google" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button className="auth-social-btn telegram" onClick={handleTelegramLogin}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#2AABEE">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.674l-2.95-.924c-.642-.204-.654-.642.136-.953l11.538-4.45c.535-.194 1.003.13.858.9z"/>
                </svg>
              </button>
              <button className="auth-social-btn steam" onClick={() => alert('Steam login coming soon!')}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z"/>
                </svg>
              </button>
            </div>

            <div className="auth-login-link">
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </>
        ) : (
          <>
            {/* OTP Verification step */}
            <div className="otp-info">
              <div className="otp-icon">📱</div>
              <div className="otp-title">Verify Your Number</div>
              <div className="otp-desc">OTP sent to +91 {form.phone}</div>
              <div className="otp-dev-note">
                [Dev mode] Check browser console for OTP
              </div>
            </div>

            <div className="auth-field">
              <span className="auth-field-icon">🔢</span>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center' }}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-btn-green" onClick={handleVerifyAndRegister} disabled={loading}>
              {loading ? 'Creating account...' : 'Verify & Register'}
            </button>

            <button className="auth-back-btn" onClick={() => { setStep('form'); setError(''); }}>
              ← Back
            </button>

            <div className="auth-resend" onClick={handleSendOtp}>
              Resend OTP
            </div>
          </>
        )}
      </div>
    </div>
  );
}
