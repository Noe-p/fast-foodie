import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { MEDIA_QUERIES } from '@/static/constants';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useMediaQuery } from 'usehooks-ts';
import { Col, Row } from '..';
import { Button } from '../ui/button';

interface DrawerDialogProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  button?: React.ReactNode;
  isFooter?:boolean;
  className?: string;
}

export function DrawerDialog(props: DrawerDialogProps): JSX.Element {
  const {
    children,
    description,
    title,
    open = false,
    setOpen,
    isFooter = true,
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
            {description && <DialogDescription>{description}</DialogDescription>}
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
        <Col className='px-4 pb-4'>{children}</Col>
        {isFooter && <DrawerFooter className='pt-2 pb-15'>
          <DrawerClose asChild>
            <Row className='justify-end gap-2'>
              <Button variant='outline'>{t('generics.save')}</Button>
            </Row>
          </DrawerClose>
        </DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
