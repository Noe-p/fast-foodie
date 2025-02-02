import { LayoutPage } from '@/components';
import { AuthWall } from '@/container/components';
import { ShoppingListPage } from '@/container/pages';
import { PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function IndexPage(): React.JSX.Element {
  return (
    <AuthWall>
      <LayoutPage>
        <ShoppingListPage />
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
