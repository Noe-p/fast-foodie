import { DrawerMotion } from '@/components/Drawer';
import { useTranslation } from 'next-i18next';
import tw from 'tailwind-styled-components';
import { Col } from '@/components/Helpers';
import { Edit, LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerType, useAppContext, useAuthContext } from '@/contexts';
import { P14 } from '@/components';
import { ApiService } from '@/services/api';
import { useState } from 'react';


interface DrawerDetailUserProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerDetailUser(props: DrawerDetailUserProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { currentUser, removeToken } = useAuthContext();
  const { setDrawerOpen } = useAppContext();
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  async function handleLogout() {
    setIsLoading(true);
    await ApiService.auth.logout();
    removeToken();
    onClose();
    setIsLoading(false);
  }

  return (
    <DrawerMotion className='lain_background' isOpen={isOpen} onClose={onClose} title={t('user:detail.title')}>
      <Content className={className}>
        <Col className='gap-4'>
          <Col>
            <Label>{t('fields:userName.label')}</Label>
            <Text $empty={!currentUser?.userName}>
              {currentUser?.userName}
            </Text>
          </Col>
          <Col>
            <Label>{t('fields:email.label')}</Label>
            <Text $empty={!currentUser?.email}>
              {currentUser?.email ?? t('generics.noData')}
            </Text>
          </Col>
        </Col>

        <Button
          className='w-full  mt-10 '
          onClick={() => setDrawerOpen(DrawerType.UPDATE_USER)}
        >
          <Edit size={20} className='mr-2' />
          {t('generics.edit')}
        </Button>
        <Button
          className='w-full mt-2'
          onClick={() => handleLogout()}
          isLoading={isLoading}
          variant={'destructive'}
        >
          <LogOutIcon size={20} className='mr-2' />
          {t('generics.logout')}
        </Button>
      </Content>
    </DrawerMotion>
  );
}

const Content = tw(Col)`
  px-5
  pb-10
  justify-between
  items-between
`;

const Label = tw(P14)`
  font-semibold
`;

const Text = tw(P14)<{ $empty?: boolean }>`
  ${(props) => props.$empty && 'text-primary/50'}
`;

const Place = tw.div`
  bg-background
  rounded
  px-3
  py-1
  w-fit
`;
