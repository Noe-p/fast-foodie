import { Avatar, P10 } from '@/components';
import { Col, ColCenter, Row, RowCenter } from '@/components/Helpers';
import { DrawerType, useAppContext, useAuthContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { cn } from '@/services/utils';
import { CollaboratorStatus } from '@/types';
import {
  CalendarFoldIcon,
  PlusCircle,
  SaladIcon,
  ShoppingCartIcon,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import tw from 'tailwind-styled-components';

interface TabbarProps {
  className?: string;
}

export function Tabbar(props: TabbarProps): JSX.Element {
  const { className } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { setDrawerOpen } = useAppContext();

  const KEYS = [
    {
      path: ROUTES.dishes.index,
      icon: <SaladIcon size={22} />,
      action: () => router.push(ROUTES.dishes.index),
      name: t('dishes:title'),
    },
    {
      path: ROUTES.dishes.week,
      icon: <CalendarFoldIcon size={22} />,
      action: () => router.push(ROUTES.dishes.week),
      name: t('dishes:week.title'),
    },
    {
      path: ROUTES.dishes.create,
      icon: <PlusCircle size={22} />,
      action: () => router.push(ROUTES.dishes.create),
      name: t('generics.create'),
    },
    {
      path: ROUTES.shoppingList,
      icon: <ShoppingCartIcon size={22} />,
      action: () => router.push(ROUTES.shoppingList),
      name: t('shoppingList:title'),
    },
    {
      path: ROUTES.user,
      icon: (
        <Col className='relative'>
          <Avatar user={currentUser} />
          {currentUser?.collaborators &&
            currentUser?.collaborators?.filter(
              (colab) => colab.status === CollaboratorStatus.IS_PENDING
            ).length > 0 && (
              <Notification>
                <P10 className='text-background'>
                  {
                    currentUser?.collaborators?.filter(
                      (colab) => colab.status === CollaboratorStatus.IS_PENDING
                    ).length
                  }
                </P10>
              </Notification>
            )}
        </Col>
      ),
      action: () => setDrawerOpen(DrawerType.DETAIL_USER),
      name: currentUser?.userName || '',
    },
  ];

  const selected = KEYS.find((key) => key.path === router.pathname);

  return (
    <Main className={className}>
      <RowCenter className='w-full rounded-none p-2 pb-7 min-h-15 bg-primary justify-between gap-2'>
        {KEYS.map((key) => (
          <Item
            key={key.name}
            $selected={selected === key}
            onClick={() => {
              key.action();
            }}
          >
            {key.icon}
            <P10 className={cn('mt-1 text-background')}>{key.name}</P10>
          </Item>
        ))}
      </RowCenter>
    </Main>
  );
}

const Main = tw(Row)`
  fixed
  bottom-0
  left-0
  right-0
  z-10
`;

const Item = tw(ColCenter)<{ $selected?: boolean }>`
  min-w-15 

  w-full 
  rounded 
  justify-between
  cursor-pointer
  text-background
  ${(props) => (props.$selected ? 'opacity-100' : 'opacity-60')}
`;

const Notification = tw(ColCenter)`
  rounded-full
  bg-destructive
  w-5
  h-5
  absolute
  items-center
  justify-center
  top-0
  right-0
  transform
  translate-x-1/2
  -translate-y-1/2
`;
