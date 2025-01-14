import { LayoutPage } from '@/components';
import LoginPage from '@/container/pages/LoginPage';
import { PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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
