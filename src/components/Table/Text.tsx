import { cn } from '@/services/utils';
import { Column, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { P12 } from '../Texts';
import { Badge } from '../ui/badge';

interface CellTextProps<TData> {
  row: Row<TData>;
  name: string;
  className?: string;
  type?: 'enum' | 'boolean' | 'date' | 'default';
}

export function CellText<TData>({
  row,
  className,
  type,
  name,
}: CellTextProps<TData>) {
  const { t } = useTranslation();
  const value: string = row.getValue(name);
  switch (type) {
    case 'enum':
      return <P12 className={className}>{t(`enums:${value}`)}</P12>;
    case 'boolean':
      return (
        <Badge
          className={cn(
            className,
            'h-6',
            value
              ? 'bg-green/20 border-green text-green'
              : 'bg-destructive/20 border-destructive text-destructive'
          )}
          variant='outline'
        >
          {value ? <Check size={12} /> : <X size={12} />}
        </Badge>
      );
    case 'date':
      return (
        <P12 className={className}>{format(new Date(value), 'dd/MM/yyyy')}</P12>
      );
    default:
      return <P12 className={className}>{value}</P12>;
  }
}

interface HeaderTextProps<TData> {
  column: Column<TData>;
  i18nKey: string;
  className?: string;
}

export function HeaderText<TData>({
  column,
  className,
  i18nKey,
}: HeaderTextProps<TData>) {
  const { t } = useTranslation();

  return (
    <P12
      className={cn('font-bold', className)}
    >
      {t(i18nKey)}
    </P12>
  );
}
