import { Column, Row } from '@tanstack/react-table';
import { ArrowUpDown, Check, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { P12 } from '../Texts';
import { Button } from '../ui/button';
import { useAppContext } from '@/contexts';
import { Badge } from '../ui/badge';
import { cn } from '@/services/utils';

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
  const { searchParams, setSearchParams } = useAppContext();

  return (
    <Button
      variant='ghost'
      className={className}
      onClick={() => {
        setSearchParams({
          orderType: searchParams.orderType === 'ASC' ? 'DESC' : 'ASC',
          orderBy: column.id,
          page: 0,
        });
      }}
    >
      {t(i18nKey)}
      <ArrowUpDown className='ml-2 h-4 w-4' />
    </Button>
  );
}
