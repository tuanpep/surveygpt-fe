import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  PasswordInput,
  FluidForm,
  FluidTextInput,
  FluidPasswordInput,
  InlineNotification,
  Heading,
  Link as CarbonLink,
  Stack,
  Checkbox,
  Tile,
} from '@carbon/react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { forgotPassword } from '@/services/auth';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

const signInEmailSchema = z.string().min(1, 'Email is required').email('Enter a valid email address');

const signInPasswordSchema = z.string().min(1, 'Password is required');

const LOGIN_EMAIL_STORAGE_KEY = 'surveygpt_login_email';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem(LOGIN_EMAIL_STORAGE_KEY);
    if (saved) {
      setEmail(saved);
      setRememberId(true);
    }
  }, []);

  const persistRememberedEmail = () => {
    if (rememberId) {
      localStorage.setItem(LOGIN_EMAIL_STORAGE_KEY, email.trim());
    } else {
      localStorage.removeItem(LOGIN_EMAIL_STORAGE_KEY);
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const emailParsed = signInEmailSchema.safeParse(email.trim());
    if (!emailParsed.success) {
      setFieldErrors({ email: emailParsed.error.issues[0]?.message ?? 'Enter a valid email address' });
      return;
    }

    const pwParsed = signInPasswordSchema.safeParse(password);
    if (!pwParsed.success) {
      setFieldErrors({ password: pwParsed.error.issues[0]?.message ?? 'Password is required' });
      return;
    }

    persistRememberedEmail();

    try {
      await signIn({ email: emailParsed.data, password });
      navigate('/app/dashboard');
    } catch {
      setError('Incorrect email or password. Try again.');
      setPassword('');
      setFieldErrors({});
    }
  };

  return (
    <AuthPageShell>
      <section className="auth-saas__panel" aria-labelledby="signin-heading">
        <Tile className="auth-saas__card">
          <FluidForm onSubmit={handleLogIn}>
            <Stack gap={5}>
              <div className="auth-saas__card-header">
                <Heading id="signin-heading" className="auth-saas__title">
                  Log in
                </Heading>
                <p className="auth-saas__subtitle">
                  Sign in with your work email and password.
                </p>
              </div>

              {error && (
                <InlineNotification
                  kind="error"
                  title="Could not log in"
                  subtitle={error}
                  onClose={() => setError('')}
                />
              )}

              <FluidTextInput
                id="signin-email"
                labelText="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!fieldErrors.email}
                invalidText={fieldErrors.email}
              />
              <FluidPasswordInput
                id="signin-password"
                labelText="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!fieldErrors.password}
                invalidText={fieldErrors.password}
              />
              <div className="auth-page__links auth-page__links--signin-row">
                <CarbonLink as={Link} to="/forgot-password">
                  Forgot password?
                </CarbonLink>
              </div>
              <Checkbox
                id="signin-remember"
                labelText="Remember email on this device"
                checked={rememberId}
                onChange={(_, { checked }) => setRememberId(checked)}
              />
              <Button type="submit" kind="primary" className="auth-page__submit">
                Log in
              </Button>

              <p className="auth-page__hint">
                Don&apos;t have an account?{' '}
                <CarbonLink as={Link} to="/signup">
                  Create an account
                </CarbonLink>
              </p>
            </Stack>
          </FluidForm>
        </Tile>
      </section>
    </AuthPageShell>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const result = signUpSchema.safeParse({ name, email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await signUp({ name, email, password });
      navigate('/app/dashboard');
    } catch {
      setError('Could not create account. Please try again.');
    }
  };

  return (
    <AuthPageShell>
      <section className="auth-saas__panel" aria-labelledby="signup-heading">
        <Tile className="auth-saas__card">
          <FluidForm onSubmit={handleSubmit}>
            <Stack gap={5}>
              <div className="auth-saas__card-header">
                <Heading id="signup-heading" className="auth-saas__title">
                  Create account
                </Heading>
                <p className="auth-saas__subtitle">
                  Start free — no credit card required. You can upgrade anytime.
                </p>
              </div>
              {error && (
                <InlineNotification
                  kind="error"
                  title="Sign up failed"
                  subtitle={error}
                  onClose={() => setError('')}
                />
              )}
              <FluidTextInput
                id="signup-name"
                labelText="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                invalid={!!fieldErrors.name}
                invalidText={fieldErrors.name}
              />
              <FluidTextInput
                id="signup-email"
                labelText="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!fieldErrors.email}
                invalidText={fieldErrors.email}
              />
              <PasswordInput
                id="signup-password"
                labelText="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="At least 8 characters"
                invalid={!!fieldErrors.password}
                invalidText={fieldErrors.password}
              />
              <Button type="submit" kind="primary" className="auth-page__submit">
                Create account
              </Button>
              <p className="auth-page__hint">
                Already have an account?{' '}
                <CarbonLink as={Link} to="/signin">Log in</CarbonLink>
              </p>
            </Stack>
          </FluidForm>
        </Tile>
      </section>
    </AuthPageShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <AuthPageShell>
      <section className="auth-saas__panel" aria-labelledby="forgot-heading">
        <Tile className="auth-saas__card">
          <FluidForm onSubmit={handleSubmit}>
            <Stack gap={5}>
              <div className="auth-saas__card-header">
                <Heading id="forgot-heading" className="auth-saas__title">
                  Reset password
                </Heading>
                <p className="auth-saas__subtitle">
                  {submitted
                    ? 'Check your inbox for the next step.'
                    : 'We’ll send a one-time link to the address you use to sign in.'}
                </p>
              </div>
              {submitted && (
                <InlineNotification
                  kind="success"
                  title="Check your email"
                  subtitle="Password reset instructions have been sent."
                  hideCloseButton
                />
              )}
              {submitted && (
                <div className="auth-page__links">
                  <CarbonLink as={Link} to="/signin">Back to Log in</CarbonLink>
                </div>
              )}
              {!submitted && (
                <FluidTextInput
                  id="forgot-email"
                  labelText="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  invalid={!!fieldErrors.email}
                  invalidText={fieldErrors.email}
                />
              )}
              {!submitted && (
                <Button type="submit" kind="primary" className="auth-page__submit">
                  Send reset link
                </Button>
              )}
              {!submitted && (
                <div className="auth-page__links">
                  <CarbonLink as={Link} to="/signin">Back to Log in</CarbonLink>
                </div>
              )}
            </Stack>
          </FluidForm>
        </Tile>
      </section>
    </AuthPageShell>
  );
}
