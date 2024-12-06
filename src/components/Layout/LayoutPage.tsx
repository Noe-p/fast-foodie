import { SeoHead } from '@/container/components';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ReactNode } from 'react';

interface LayoutPageProps {
  children?: ReactNode;
}

export function LayoutPage(props: LayoutPageProps): JSX.Element {
  const { children } = props;

  return (
    <>
      <SeoHead />
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
