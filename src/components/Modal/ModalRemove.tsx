import { Button } from '@/components/ui/button';

import { Loader2, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import tw from 'tailwind-styled-components';
import { Row, RowBetween } from '../Helpers';
import { P16 } from '../Texts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface ModalRemoveProps {
  onRemove: () => void;
  className?: string;
  isPending?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function ModalRemove(props: ModalRemoveProps): JSX.Element {
  const { onRemove, className, isPending, icon, onClick } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {icon ? (
          icon
        ) : (
          <RowBetween
            onClick={() => {
              if (onClick) onClick();
            }}
            className='bg-background text-primary p-2 rounded-lg gap-2 items-center'
          >
            {isPending ? (
              <Loader2 className='w-5 h-5 animate-spin' />
            ) : (
              <Trash2Icon />
            )}
            <P16>{t('generics.remove')}</P16>
          </RowBetween>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('modal.remove.title')}</DialogTitle>
          <DialogDescription>{t('modal.remove.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Row className='mt-5 justify-end gap-2'>
            <Button
              type='button'
              onClick={() => setOpen(false)}
              variant='outline'
            >
              {t('generics.cancel')}
            </Button>
            <Button
              variant='destructive'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                setOpen(false);
              }}
            >
              {t('generics.continue')}
            </Button>
          </Row>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Content = tw.div`
  px-4
  pb-5
`;
