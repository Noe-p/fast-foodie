import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PageBaseProps } from '../types';
import { LayoutPage } from '../components';
import RegisterPage from '../container/pages/RegisterPage';
import React from 'react';


export default function Register(): React.JSX.Element {
  return (
    <LayoutPage>
      <RegisterPage />
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
