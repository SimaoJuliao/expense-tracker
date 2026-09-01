import { cn } from '@/lib/utils';

interface Props {
  name: string;
  color?: string | null;
  className?: string;
}

/** Colour-tinted monogram (first letter) used as a platform's visual identity. */
export const PlatformAvatar = ({ name, color, className }: Props) => {
  const c = color ?? '#6366f1';
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex items-center justify-center rounded-lg font-semibold shrink-0', className)}
      style={{ backgroundColor: `${c}22`, color: c }}
    >
      {name.charAt(0).toUpperCase() || '?'}
    </span>
  );
};
