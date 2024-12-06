import { ReactNode } from 'react';
import {
  Tooltip as ShTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface TooltipProps {
  children?: ReactNode;
  className?: string;
  label: ReactNode;
}

export function Tooltip(props: TooltipProps): JSX.Element {
  const { children, className, label } = props;

  return (
    <TooltipProvider>
      <ShTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={className}>{label}</TooltipContent>
      </ShTooltip>
    </TooltipProvider>
  );
}
