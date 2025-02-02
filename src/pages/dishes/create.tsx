import { AuthWall } from '@/container/components';
import { CreateDishPage } from '@/container/pages';
import { PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LayoutPage } from '../../components';

export default function Detail(): React.JSX.Element {
  return (
    <AuthWall>
      <LayoutPage>
        <CreateDishPage />
      </LayoutPage>
    </AuthWall>
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
