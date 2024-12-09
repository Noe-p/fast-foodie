import { P12, P14 } from '@/components';
import { Col, Row, RowCenter } from '@/components/Helpers';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DrawerType, useAppContext, useAuthContext } from '@/contexts';
import { cn } from '@/services/utils';
import { ROUTES } from '@/routes';
import { Home } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import tw from 'tailwind-styled-components';
import { AVATAR_PLACEHOLDER_URL } from '@/static/constants';

interface SideMenuProps {
  className?: string;
}

export function SideMenu(props: SideMenuProps): JSX.Element {
  const { className } = props;
  const router = useRouter();
  const { currentUser } = useAuthContext();
  const { setDrawerOpen, drawerOpen } = useAppContext();
  const { t } = useTranslation();

  const KEYS = [
    {
      icon: <Home size={18} />,
      name: t('home.title'),
      path: ROUTES.home,
    },
  ];
  const selected = KEYS.find((key) => key.path === router.pathname);

  return (
    <Main className={className}>
      <LogoContainer>
        <Logo src='/logo.svg' alt='logi' />
      </LogoContainer>
      <Separator className='bg-muted' />
      <Menu>
        {KEYS.map((key) => (
          <MenuItem
            onClick={() => router.push(key.path)}
            $selected={key === selected}
            key={key.path}
          >
            {key.icon}
            <P14
              className={cn(
                key === selected ? 'text-primary' : 'text-background '
              )}
            >
              {key.name}
            </P14>
          </MenuItem>
        ))}
      </Menu>
      <Footer>
        <MenuItem
          onClick={() => setDrawerOpen(DrawerType.DETAIL_USER)}
          $selected={drawerOpen === DrawerType.DETAIL_USER}
        >
          <Avatar className='border border-background/90 w-[30px] h-[30px]'>
            <AvatarImage
              src={currentUser?.profilePicture?.url ?? AVATAR_PLACEHOLDER_URL}
              alt='Profile picture'
            />
          </Avatar>
          <Col className='ml-2'>
            <P12
              className={cn(
                drawerOpen === DrawerType.DETAIL_USER
                  ? 'text-primary'
                  : 'text-background'
              )}
            >
              {`${currentUser?.userName} ${currentUser?.lastName}`}
            </P12>
          </Col>
        </MenuItem>
      </Footer>
    </Main>
  );
}

const Main = tw(Col)`
  my-3 ml-3
  rounded-md
  bg-primary
  p-3
  gap-3
  items-center
  z-10
  shadow-md
`;

const LogoContainer = tw(RowCenter)`
  w-full
  justify-center
`;

const Logo = tw.img`
  w-20 h-20
`;

const Menu = tw(Col)`
  h-full
  w-full
  gap-3
`;

const MenuItem = tw(Row)<{ $selected?: boolean }>`
  gap-3
  w-full
  px-3
  py-2
  rounded-md
  items-center
  justify-start
  cursor-pointer
  transition
  border
  border-transparent

  ${({ $selected }) =>
    $selected
      ? 'bg-background text-primary'
      : 'text-background hover:border-muted'}

`;

const Footer = tw(Row)`
  w-full
  border-t
  border-muted
  pt-3

`;
