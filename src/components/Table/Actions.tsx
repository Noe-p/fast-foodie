import {
  ClipboardCopy,
  ExternalLink,
  MoreHorizontal,
  PenBoxIcon
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../ui/use-toast';

interface ActionsProps extends DropdownMenuProps {
  children?: ReactNode;
  className?: string;
}

export function Actions(props: ActionsProps): JSX.Element {
  const { children, className } = props;
  const { t } = useTranslation();

  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={className} align='end'>
        <DropdownMenuLabel>{t('generics.actions')}</DropdownMenuLabel>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ActionCopy(props: {
  field: string;
  value: string;
  i18nKey?: string;
}): JSX.Element {
  const { field, value, i18nKey = 'generics.copy' } = props;
  const { toast } = useToast();
  const { t } = useTranslation();
  return (
    <DropdownMenuItem
      className='cursor-pointer'
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(value);
        toast({
          title: t('toast.copy'),
          description: t(`table:columns.${field}`) + ' : ' + value,
        });
      }}
    >
      <ClipboardCopy className='w-4 h-4 mr-2' />
      <span>{t(i18nKey)}</span>
    </DropdownMenuItem>
  );
}

export function ActionRedirection(props: {
  onRedirection: () => void;
  i18nKey?: string;
}): JSX.Element {
  const { onRedirection, i18nKey = 'table:seeDetail' } = props;
  const { t } = useTranslation();
  return (
    <DropdownMenuItem
      className='cursor-pointer'
      onClick={() => onRedirection()}
    >
      <ExternalLink className='w-4 h-4 mr-2' />
      <span>{t(i18nKey)}</span>
    </DropdownMenuItem>
  );
}

export function ActionEdit(props: {
  onEdit: () => void;
  i18nKey?: string;
}): JSX.Element {
  const { onEdit, i18nKey = 'generics.edit' } = props;
  const { t } = useTranslation();
  return (
    <DropdownMenuItem
      className='cursor-pointer'
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
    >
      <PenBoxIcon className='w-4 h-4 mr-2' />
      <span>{t(i18nKey)}</span>
    </DropdownMenuItem>
  );
}

