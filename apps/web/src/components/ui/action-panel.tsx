'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/shared/utils';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionPanelProps {
  /**
   * Whether the panel is visible
   */
  open: boolean;
  
  /**
   * Callback when panel should close
   */
  onClose?: () => void;
  
  /**
   * Icon to display on the left side
   */
  icon?: ReactNode;
  
  /**
   * Title or message to display
   */
  title?: string;
  
  /**
   * Description text (optional)
   */
  description?: string;
  
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  
  /**
   * Secondary action button (optional)
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  
  /**
   * Additional actions (optional)
   */
  actions?: Array<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  
  /**
   * Custom content to render instead of title/description
   */
  children?: ReactNode;
  
  /**
   * Color variant for the panel
   */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  
  /**
   * Position of the panel
   */
  position?: 'bottom' | 'top';
  
  /**
   * Additional className for the panel
   */
  className?: string;
  
  /**
   * Show close button
   */
  showClose?: boolean;
}

const variantStyles = {
  default: {
    card: 'bg-popover text-popover-foreground border-border shadow-xl',
    icon: 'text-foreground',
    title: 'text-foreground',
  },
  info: {
    card: 'bg-blue-50/90 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100 shadow-xl backdrop-blur-sm',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
  },
  success: {
    card: 'bg-green-50/90 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-100 shadow-xl backdrop-blur-sm',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
  },
  warning: {
    card: 'bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100 shadow-xl backdrop-blur-sm',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-100',
  },
  error: {
    card: 'bg-destructive/10 border-destructive/20 text-destructive shadow-xl backdrop-blur-sm',
    icon: 'text-destructive',
    title: 'text-destructive font-semibold',
  },
};

export function ActionPanel({
  open,
  onClose,
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  actions = [],
  children,
  variant = 'default',
  position = 'bottom',
  className,
  showClose = true,
}: ActionPanelProps) {
  if (!open) return null;

  const styles = variantStyles[variant];
  const positionClasses = position === 'bottom' 
    ? 'bottom-6 animate-in slide-in-from-bottom-5' // Added margin bottom-6
    : 'top-6 animate-in slide-in-from-top-5';     // Added margin top-6

  return (
    <div 
      className={cn(
        'fixed left-0 right-0 z-50 mx-auto max-w-3xl px-4', // Increased max-width to 3xl
        positionClasses,
        className
      )}
    >
      <Card className={cn('shadow-xl border', styles.card)}>
        <CardContent className="py-4 px-6"> 
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Icon + Content */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {icon && (
                <div className={cn('flex-shrink-0', styles.icon)}>
                  {icon}
                </div>
              )}
              
              {children ? (
                <div className="flex-1 min-w-0">{children}</div>
              ) : (
                <div className="flex-1 min-w-0">
                  {title && (
                    <p className={cn('font-medium leading-none', styles.title)}>
                      {title}
                    </p>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground/80 mt-1.5 font-normal">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Additional actions */}
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="bg-background/50 hover:bg-background/80 border-transparent shadow-sm"
                >
                  {action.label}
                </Button>
              ))}
              
              {/* Secondary action */}
              {secondaryAction && (
                <Button
                  variant={secondaryAction.variant || 'outline'}
                  size="sm"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className={cn(
                    'bg-background/50 hover:bg-background/80 shadow-sm', 
                    secondaryAction.variant === 'outline' && 'border-transparent' // Cleaner look for outline buttons in colored context
                  )}
                >
                  {secondaryAction.label}
                </Button>
              )}
              
              {/* Primary action */}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'default'}
                  size="sm"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                  className="shadow-sm"
                >
                  {primaryAction.loading ? 'Đang xử lý...' : primaryAction.label}
                </Button>
              )}
              
              {/* Close button */}
              {showClose && onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-1 opacity-70 hover:opacity-100"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
