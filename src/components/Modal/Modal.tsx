import { Button } from '@/components/ui/button';
import { cn } from '@/services/utils';
import { useTranslation } from 'next-i18next';
import tw from 'tailwind-styled-components';
import { DrawerMotion } from '../Drawer';
import { Row } from '../Helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
  button?: React.ReactNode;
  title?: string;
}

export function Modal(props: ModalProps): JSX.Element {
  const { children, className, isOpen, onClose, button, title } = props;
  const { t } = useTranslation();

  return (
    <DrawerMotion
      placement='bottom'
      className={cn('lain_background', className)}
      title={title}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Content>
        {children}
        <Row className='mt-5 justify-end gap-2'>
          <Button onClick={() => onClose()} variant='outline'>
            {t('generics.cancel')}
          </Button>
          {button}
        </Row>
      </Content>
    </DrawerMotion>
  );
}

const Content = tw.div`
  px-4
  pb-5
`;
