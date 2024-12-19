import { Footer, SideMenu, Tabbar } from '@/container/components';
import { MEDIA_QUERIES } from '@/static/constants';
import React, { ReactNode } from 'react';
import tw from 'tailwind-styled-components';
import { useMediaQuery } from 'usehooks-ts';

interface LayoutProps {
  children?: ReactNode;
  className?: string;
}

export function Layout(props: LayoutProps): React.JSX.Element {
  const { children, className } = props;
  const isDesktop = useMediaQuery(MEDIA_QUERIES.LG);

  return isDesktop ? (
    <Main $isDesktop={isDesktop}>
      <SideMenu />
      <div className='overflow-y-scroll w-full'>
        <Page $isDesktop={true} className={className}>
          {children}
        </Page>
        {/* <Footer /> */}
      </div>
    </Main>
  ) : (
    <Main $isDesktop={isDesktop}>
      <Page className={className}>{children}</Page>
      {/* <Footer /> */}
      <Tabbar />
    </Main>
  );
}

const Main = tw.div<{ $isDesktop?: boolean }>`
  pb-19
  h-full

  ${({ $isDesktop }) => $isDesktop && 'flex h-screen overflow-hidden pb-0'}
`;

const Page = tw.div<{ $isDesktop?: boolean }>`
  flex
  flex-col
  z-0
  min-h-screen
  p-3 md:pt-10
  mb-5 
  overflow-hidden

  ${({ $isDesktop }) => $isDesktop && 'w-full p-5'}

`;
