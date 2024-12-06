import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'next-i18next';
import { useMediaQuery } from 'usehooks-ts';
import { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface ModalRemoveProps {
  onRemove: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function ModalRemove(props: ModalRemoveProps): JSX.Element {
  const { onRemove, className, children } = props;
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [open, setOpen] = useState(false);

  if (isDesktop) {
    return (
      <AlertDialog>
        <AlertDialogTrigger onClick={(e) => e.stopPropagation()}>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className={className}>
            <AlertDialogTitle>{t('modal.remove.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('modal.remove.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              {t('generics.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              {t('generics.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger onClick={(e) => e.stopPropagation()} asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <DrawerTitle className='text-3xl'>
            {t('modal.remove.title')}
          </DrawerTitle>
          <DrawerDescription>{t('modal.remove.description')}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className='pt-2 pb-8'>
          <DrawerClose asChild>
            <Button
              variant='destructive'
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                setOpen(false);
              }}
            >
              {t('generics.continue')}
            </Button>
          </DrawerClose>
          <DrawerClose asChild onClick={(e) => e.stopPropagation()}>
            <Button variant='outline'>{t('generics.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
