import { ColCenter, H1, LayoutPage } from '@/components';
import { PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import React from 'react';


export default function Register(): React.JSX.Element {
  return (
    <LayoutPage>
      <ColCenter className='background items-center justify-center h-screen w-screen bg-white'>
        <ColCenter className='background justify-center h-100 w-100'>
          <H1 className='text-center text-9xl'>{'F & F'}</H1>
        </ColCenter>
      </ColCenter>
    </LayoutPage>
  );
}

export async function getStaticProps({
  locale,
}: {
  locale: string;
}): Promise<PageBaseProps> {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}
