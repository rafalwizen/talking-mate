import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function Card({ children, className, onClick, selected }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 transition-all',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-secondary-dark bg-secondary hover:border-primary/50',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
