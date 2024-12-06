import { P10 } from '@/components';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { DrawerType, useAppContext, useAuthContext } from '@/contexts';
import { ROUTES } from '@/routes';
import { Home } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ColCenter, Row, RowCenter } from '@/components/Helpers';

import tw from 'tailwind-styled-components';
import { cn } from '@/services/utils';
import { AVATAR_PLACEHOLDER_URL } from '@/static/constants';

interface TabbarProps {
  className?: string;
}

export function Tabbar(props: TabbarProps): JSX.Element {
  const { className } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { setDrawerOpen, drawerOpen } = useAppContext();

  const KEYS = [
    {
      path: ROUTES.home,
      icon: <Home size={22} />,
      action: () => router.push(ROUTES.home),
      name: t('home.title'),
    },
    {
      path: ROUTES.users.detail,
      icon: (
        <Avatar
          className={cn(
            'border border-muted w-[25px] h-[25px]',
            drawerOpen === DrawerType.DETAIL_USER && 'border-background'
          )}
        >
          <AvatarImage
            src={currentUser?.profilePicture?.url ?? AVATAR_PLACEHOLDER_URL}
            alt='Profile picture'
          />
        </Avatar>
      ),
      action: () => setDrawerOpen(DrawerType.DETAIL_USER),
      name: currentUser?.firstName,
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
            onClick={key.action}
          >
            {key.icon}
            <P10
              className={
                selected === key ? '  text-background' : '  text-muted'
              }
            >
              {key.name}
            </P10>
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
  ${(props) => (props.$selected ? 'text-background' : 'text-muted')}
`;
