import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AlertElementProps = {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export function AlertElement({ title, description, variant = 'default' }: AlertElementProps) {
  const Icon = variant === 'destructive' ? AlertCircleIcon : CheckCircle2Icon;

  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert variant={variant}>
        <Icon />
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
