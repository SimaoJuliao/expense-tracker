import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { useGroupStore } from '../../store/useGroupStore';
import { useTranslation } from '../../i18n';

const PENDING_GROUP_KEY = '_pendingGroupSetup';

export type Mode = 'login' | 'register' | 'forgot';

export const useLoginPage = () => {
  const { user, loading, login, register, resetPassword } = useAuthStore();
  const { setupGroupAccount } = useGroupStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [isGroupAccount, setIsGroupAccount] = useState(false);
  const [memberNames, setMemberNames] = useState(['', '']);
  const [groupSetupFailed, setGroupSetupFailed] = useState(false);

  const uid = useId();

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setResetSent(false);
    setPassword('');
    setConfirmPassword('');
    setIsGroupAccount(false);
    setMemberNames(['', '']);
    setGroupSetupFailed(false);
  };

  const addMember = () => {
    if (memberNames.length < 4) setMemberNames((prev) => [...prev, '']);
  };

  const removeMember = (i: number) => {
    setMemberNames((prev) => prev.filter((_, idx) => idx !== i));
  };

  const setMemberName = (i: number, value: string) => {
    setMemberNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
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
      if (isGroupAccount) {
        memberNames.forEach((name, i) => {
          if (!name.trim()) e[`member_${i}`] = t('group.memberRequired');
        });
        if (memberNames.length < 2) e.members = t('group.minMembers');
        if (memberNames.length > 4) e.members = t('group.maxMembers');
      }
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
        // Complete pending group setup stored during a registration that required email confirmation
        const pendingRaw = localStorage.getItem(PENDING_GROUP_KEY);
        if (pendingRaw) {
          localStorage.removeItem(PENDING_GROUP_KEY);
          try {
            const pending = JSON.parse(pendingRaw) as { email: string; members: string[] };
            if (pending.email === email) {
              await setupGroupAccount(pending.members);
              toast.success(t('group.setupSuccess'));
            } else {
              toast.success(t('auth.welcomeBack'));
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            toast.error(msg || t('common.error'));
          }
        } else {
          toast.success(t('auth.welcomeBack'));
        }
        navigate('/');
      } else if (mode === 'register') {
        await register(email, password);
        // register() sets user in the store only when Supabase auto-confirms (email confirmation disabled).
        // If user is null here, the account was created but email confirmation is required first.
        const autoLoggedIn = !!useAuthStore.getState().user;
        if (isGroupAccount) {
          if (autoLoggedIn) {
            try {
              await setupGroupAccount(memberNames.map((n) => n.trim()));
            } catch (groupErr) {
              const msg = groupErr instanceof Error ? groupErr.message : '';
              toast.error(msg || t('common.error'));
              setGroupSetupFailed(true);
              return;
            }
            toast.success(t('group.setupSuccess'));
            navigate('/');
          } else {
            localStorage.setItem(PENDING_GROUP_KEY, JSON.stringify({
              email,
              members: memberNames.map((n) => n.trim()),
            }));
            toast.success(t('auth.accountCreatedConfirmEmail'));
            switchMode('login');
          }
        } else {
          if (autoLoggedIn) {
            toast.success(t('auth.welcomeBack'));
            navigate('/');
          } else {
            toast.success(t('auth.accountCreatedConfirmEmail'));
            switchMode('login');
          }
        }
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      const lower = msg.toLowerCase();
      if (lower.includes('user_already_registered') || lower.includes('already registered')) {
        toast.error(t('auth.emailAlreadyRegistered'));
      } else if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
        toast.error(t('auth.emailNotConfirmed'));
      } else {
        toast.error(msg || t('common.error'));
      }
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
    isGroupAccount, setIsGroupAccount,
    memberNames, setMemberName, addMember, removeMember,
    groupSetupFailed,
    emailId: `${uid}-email`,
    passwordId: `${uid}-password`,
    confirmId: `${uid}-confirm`,
    t,
  };
};
