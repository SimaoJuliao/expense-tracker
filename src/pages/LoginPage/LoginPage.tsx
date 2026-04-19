import { Navigate } from 'react-router-dom';
import { Wallet, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginPage } from './LoginPage.helper';
import type { Mode } from './LoginPage.helper';

export const LoginPage = () => {
  const {
    user, loading, mode, switchMode,
    email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword,
    errors, setErrors, submitting, resetSent,
    handleSubmit, emailId, passwordId, confirmId, t,
  } = useLoginPage();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" id="main-content">
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/8 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">

          <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Wallet className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {mode === 'forgot' ? t('auth.forgotPasswordTitle') : t('common.appName')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'forgot' ? t('auth.forgotPasswordSubtitle') : t('auth.tagline')}
            </p>
          </div>

          <div className="px-8 pb-8">
            {mode === 'forgot' && resetSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/15">
                  <MailCheck className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('auth.resetEmailSent')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('auth.resetEmailSentMessage', { email })}
                  </p>
                </div>
                <button
                  onClick={() => switchMode('login')}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline mx-auto"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('auth.backToSignIn')}
                </button>
              </div>

            ) : mode === 'forgot' ? (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor={emailId} className="text-[13px] font-medium">
                    {t('auth.email')}
                    <span aria-hidden="true" className="text-destructive ml-0.5">{t('common.requiredMark')}</span>
                  </Label>
                  <Input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                    required
                    aria-required="true"
                    aria-describedby={errors.email ? `${emailId}-error` : undefined}
                    aria-invalid={!!errors.email}
                    className={`h-10 text-sm ${errors.email ? 'border-destructive' : ''}`}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                  {errors.email && (
                    <p id={`${emailId}-error`} role="alert" className="text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={submitting || loading} aria-busy={submitting} className="w-full h-10 gap-2 font-medium">
                  {submitting ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
                  {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </Button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mx-auto transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('auth.backToSignIn')}
                </button>
              </form>

            ) : (
              <>
                <div
                  role="tablist"
                  aria-label={t('auth.authMode')}
                  className="flex bg-muted rounded-xl p-1 mb-6"
                >
                  {(['login', 'register'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 ${
                        mode === m
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m === 'login' ? t('auth.signIn') : t('auth.createAccount')}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label={mode === 'login' ? t('auth.signInForm') : t('auth.createAccountForm')}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor={emailId} className="text-[13px] font-medium">
                      {t('auth.email')}
                      <span aria-hidden="true" className="text-destructive ml-0.5">{t('common.requiredMark')}</span>
                    </Label>
                    <Input
                      id={emailId}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                      required
                      aria-required="true"
                      aria-describedby={errors.email ? `${emailId}-error` : undefined}
                      aria-invalid={!!errors.email}
                      className={`h-10 text-sm ${errors.email ? 'border-destructive' : ''}`}
                      placeholder={t('auth.emailPlaceholder')}
                    />
                    {errors.email && (
                      <p id={`${emailId}-error`} role="alert" className="text-xs text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={passwordId} className="text-[13px] font-medium">
                        {t('auth.password')}
                        <span aria-hidden="true" className="text-destructive ml-0.5">{t('common.requiredMark')}</span>
                      </Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {t('auth.forgotPassword')}
                        </button>
                      )}
                    </div>
                    <Input
                      id={passwordId}
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                      required
                      aria-required="true"
                      aria-describedby={errors.password ? `${passwordId}-error` : mode === 'register' ? 'password-hint' : undefined}
                      aria-invalid={!!errors.password}
                      className={`h-10 text-sm ${errors.password ? 'border-destructive' : ''}`}
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    {mode === 'register' && (
                      <p id="password-hint" className="text-xs text-muted-foreground">
                        {t('auth.passwordHint')}
                      </p>
                    )}
                    {errors.password && (
                      <p id={`${passwordId}-error`} role="alert" className="text-xs text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <Label htmlFor={confirmId} className="text-[13px] font-medium">
                        {t('auth.confirmPassword')}
                        <span aria-hidden="true" className="text-destructive ml-0.5">{t('common.requiredMark')}</span>
                      </Label>
                      <Input
                        id={confirmId}
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); }}
                        required
                        aria-required="true"
                        aria-describedby={errors.confirmPassword ? `${confirmId}-error` : undefined}
                        aria-invalid={!!errors.confirmPassword}
                        className={`h-10 text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        placeholder={t('auth.passwordPlaceholder')}
                      />
                      {errors.confirmPassword && (
                        <p id={`${confirmId}-error`} role="alert" className="text-xs text-destructive">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting || loading}
                    aria-busy={submitting}
                    className="w-full h-10 mt-2 gap-2 font-medium"
                  >
                    {submitting
                      ? (mode === 'login' ? t('auth.signingIn') : t('auth.creatingAccount'))
                      : (mode === 'login' ? t('auth.signIn') : t('auth.createAccount'))}
                    {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
