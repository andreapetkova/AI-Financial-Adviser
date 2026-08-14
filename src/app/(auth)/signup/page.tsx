'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TextInput } from '@/components/TextInput';
import { SubmitButton } from '@/components/SubmitButton';
import { FormErrorAlert } from '@/components/FormErrorAlert';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      const { requiresEmailConfirmation } = await signUp(email, password);
      if (requiresEmailConfirmation) {
        setConfirmationSentTo(email);
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationSentTo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Mail className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to{' '}
                <span className="font-medium text-foreground">{confirmationSentTo}</span>.
                Click the link to activate your account, then sign in.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-xl font-bold text-primary-foreground">F</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your finances with AI
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-card p-8 shadow-md border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <FormErrorAlert message={error} />}

            <TextInput
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <TextInput
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />

            <TextInput
              id="confirm-password"
              label="Confirm password"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />

            <div className="pt-1">
              <SubmitButton disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create account'}
              </SubmitButton>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {"Already have an account? "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
