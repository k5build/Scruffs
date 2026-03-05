import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary/10 text-primary border border-primary/20',
        secondary:   'bg-secondary text-secondary-foreground border border-border',
        outline:     'text-foreground border border-border',
        success:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning:     'bg-amber-50 text-amber-700 border border-amber-200',
        destructive: 'bg-red-50 text-red-700 border border-red-200',
        teal:        'bg-accent/20 text-accent-foreground border border-accent/30',
        dark:        'bg-primary text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
