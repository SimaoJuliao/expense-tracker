import { useTranslation } from '../../i18n';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export const useConfirmDialog = () => {
  const { t } = useTranslation();
  return { t };
};
