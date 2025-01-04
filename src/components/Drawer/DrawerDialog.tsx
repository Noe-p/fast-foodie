import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMediaQuery } from 'usehooks-ts';
import { Button } from '../ui/button';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Col } from '..';
import { useTranslation } from 'next-i18next';
import { BookOpen } from 'lucide-react';
import { MEDIA_QUERIES } from '@/static/constants';

interface DrawerDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  button?: React.ReactNode;
  className?: string;
}

export function DrawerDialog(props: DrawerDialogProps): JSX.Element {
  const {
    children,
    description,
    title,
    open = false,
    setOpen,
    button = (
      <Button variant='outline'>
        <BookOpen />
      </Button>
    ),
  } = props;
  const isDesktop = useMediaQuery(MEDIA_QUERIES.MD);
  const { t } = useTranslation();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{button}</DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='text-3xl'>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{button}</DrawerTrigger>
      <DrawerContent className='lain_background'>
        <DrawerHeader className='text-left'>
          <DrawerTitle className='text-3xl text-primary'>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <Col className='px-4 pb-8'>{children}</Col>
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='default'>{t('generics.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
