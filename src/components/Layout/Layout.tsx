import { Tabbar } from '@/container/components';
import { usePageLoading } from '@/hooks';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'tailwind-styled-components';
import { useMediaQuery } from 'usehooks-ts';
import { NetworkStatus } from '../NetworkStatus';
import { PageProgressBar } from '../Progress';
import { P16 } from '../Texts';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function Layout(props: LayoutProps): React.JSX.Element {
  const { children, className } = props;
  const isPhone = useMediaQuery('(max-width: 700px)');
  const { t } = useTranslation();
  const { isLoading } = usePageLoading();

  return !isPhone ? (
    <Main
      {...props}
      className='flex flex-col justify-center items-center h-screen w-screen'
    >
      <P16>{t('appOnlyForPhone')}</P16>
    </Main>
  ) : (
    <Main {...props}>
      <NetworkStatus />
      <PageProgressBar isLoading={isLoading} />
      <Page className={className}>{children}</Page>
      <Tabbar />
    </Main>
  );
}

const Main = tw.div`
 
`;

const Page = tw.div`
  flex
  flex-col
  min-h-screen
  p-3
  pb-25
`;
