import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PageBaseProps } from '../types';
import LoginPage from '@/container/pages/LoginPage';
import { LayoutPage } from '@/components';

export default function Login(): React.JSX.Element {
  return (
    <LayoutPage>
      <LoginPage />
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
