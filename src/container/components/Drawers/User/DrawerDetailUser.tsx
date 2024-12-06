import { DrawerMotion } from '@/components/Drawer';
import { useTranslation } from 'next-i18next';
import tw from 'tailwind-styled-components';
import { Col } from '@/components/Helpers';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerType, useAppContext, useAuthContext } from '@/contexts';
import { P14 } from '@/components';
import { AVATAR_PLACEHOLDER_URL } from '@/static/constants';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface DrawerDetailUserProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerDetailUser(props: DrawerDetailUserProps): JSX.Element {
  const { className, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { setDrawerOpen } = useAppContext();

  return (
    <DrawerMotion isOpen={isOpen} onClose={onClose} title={t('user:detail')}>
      <Content className={className}>
        <Col className='gap-4'>
          <Col>
            <Label>{t('fields:firstName.label')}</Label>
            <Text $empty={!currentUser?.firstName}>
              {currentUser?.firstName}
            </Text>
          </Col>
          <Col>
            <Label>{t('fields:lastName.label')}</Label>
            <Text $empty={!currentUser?.lastName}>{currentUser?.lastName}</Text>
          </Col>
          <Col>
            <Label>{t('fields:email.label')}</Label>
            <Text $empty={!currentUser?.email}>
              {currentUser?.email ?? t('generics.noData')}
            </Text>
          </Col>
          <Col>
            <Label>{t('fields:profilePicture.label')}</Label>
            <Avatar className='border w-[30px] h-[30px]'>
              <AvatarImage
                src={currentUser?.profilePicture?.url ?? AVATAR_PLACEHOLDER_URL}
                alt='Profile picture'
              />
            </Avatar>
          </Col>
        </Col>

        <Button
          className='w-full  mt-10 '
          onClick={() => setDrawerOpen(DrawerType.UPDATE_USER)}
        >
          <Edit size={20} className='mr-2' />
          {t('generics.edit')}
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
