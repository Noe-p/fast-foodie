import { SeoHead } from '@/container/components';
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
    </>
  );
}
