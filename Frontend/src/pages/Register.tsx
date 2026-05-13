import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import './Auth.css';

const PHONE_PATTERN = /^[0-9+\-\s()]{8,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
    }),
    [password]
  );
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength =
    password.length === 0
      ? null
      : passwordScore <= 1
      ? 'weak'
      : passwordScore === 2
      ? 'medium'
      : 'strong';

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const phoneValid = phoneNumber === '' || PHONE_PATTERN.test(phoneNumber);
  const emailValid = email === '' || EMAIL_PATTERN.test(email);

  const canSubmit =
    fullName.trim().length > 0 &&
    EMAIL_PATTERN.test(email) &&
    passwordScore >= 2 &&
    passwordsMatch &&
    phoneValid &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(
        email.trim(),
        password,
        fullName.trim(),
        phoneNumber.trim() || undefined
      );
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us to find your next stay</p>

        {error && (
          <div className="auth-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                id="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
                aria-invalid={!emailValid}
              />
            </div>
            {!emailValid && (
              <span className="field-hint error">Please enter a valid email address.</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password.length > 0 && (
              <>
                <div className={`strength-meter strength-${passwordStrength}`}>
                  <span />
                  <span />
                  <span />
                </div>
                <ul className="password-checklist">
                  <li className={passwordChecks.length ? 'pass' : ''}>
                    {passwordChecks.length ? <Check size={14} /> : <X size={14} />}
                    At least 8 characters
                  </li>
                  <li className={passwordChecks.letter ? 'pass' : ''}>
                    {passwordChecks.letter ? <Check size={14} /> : <X size={14} />}
                    Contains a letter
                  </li>
                  <li className={passwordChecks.number ? 'pass' : ''}>
                    {passwordChecks.number ? <Check size={14} /> : <X size={14} />}
                    Contains a number
                  </li>
                </ul>
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                disabled={isSubmitting}
                aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <span className={`field-hint ${passwordsMatch ? 'success' : 'error'}`}>
                {passwordsMatch ? (
                  <>
                    <Check size={14} /> Passwords match
                  </>
                ) : (
                  <>
                    <X size={14} /> Passwords do not match
                  </>
                )}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">
              Phone Number <span className="optional">(Optional)</span>
            </label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                id="phoneNumber"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09xxxxxxxxx"
                disabled={isSubmitting}
                aria-invalid={!phoneValid}
              />
            </div>
            {!phoneValid && (
              <span className="field-hint error">Please enter a valid phone number.</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spin" size={18} />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
