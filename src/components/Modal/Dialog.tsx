import { Button } from '@/components/ui/button';

import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import tw from 'tailwind-styled-components';
import { Row } from '../Helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface DialogModalProps {
  onAccept: () => void;
  onRefuse: () => void;
  className?: string;
  button: React.ReactNode;
  title: string;
  description?: string;
}

export function DialogModal(props: DialogModalProps): JSX.Element {
  const { onAccept, className, onRefuse, button, title, description } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Row className='mt-5 justify-end gap-2'>
            <Button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onRefuse();
                setOpen(false);
              }}
              variant='outline'
            >
              {t('generics.refuse')}
            </Button>
            <Button
              variant='default'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
                setOpen(false);
              }}
            >
              {t('generics.accept')}
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
