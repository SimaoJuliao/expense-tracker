import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../i18n';

export type Mode = 'login' | 'register' | 'forgot';

export const useLoginPage = () => {
  const { user, loading, login, register, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const uid = useId();

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setResetSent(false);
    setPassword('');
    setConfirmPassword('');
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email) e.email = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('auth.emailInvalid');
    if (mode !== 'forgot') {
      if (!password) e.password = t('auth.passwordRequired');
      else if (password.length < 6) e.password = t('auth.passwordTooShort');
    }
    if (mode === 'register') {
      if (!confirmPassword) e.confirmPassword = t('auth.confirmPasswordRequired');
      else if (password !== confirmPassword) e.confirmPassword = t('auth.passwordsMismatch');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(t('auth.welcomeBack'));
        navigate('/');
      } else if (mode === 'register') {
        await register(email, password);
        toast.success(t('auth.accountCreated'));
        switchMode('login');
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user, loading,
    mode, switchMode,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    errors, setErrors,
    submitting,
    resetSent,
    handleSubmit,
    emailId: `${uid}-email`,
    passwordId: `${uid}-password`,
    confirmId: `${uid}-confirm`,
    t,
  };
};
