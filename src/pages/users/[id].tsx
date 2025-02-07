import { AuthWall } from '@/container/components';
import { UserDishesPage } from '@/container/pages/users/UserDishesPage';
import { GetStaticPath, PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FullPageLoader, LayoutPage } from '../../components';

type DetailProps = {
  idPage: string;
};

export default function Detail(props: DetailProps): React.JSX.Element {
  const { idPage } = props;
  return (
    <AuthWall>
      <LayoutPage>
        {idPage ? <UserDishesPage colabId={idPage} /> : <FullPageLoader />}
      </LayoutPage>
    </AuthWall>
  );
}

export async function getStaticProps({
  locale,
  params,
}: {
  locale: string;
  params: { id: string };
}): Promise<PageBaseProps> {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
      idPage: params.id,
    },
  };
}

export async function getStaticPaths(): Promise<GetStaticPath> {
  return {
    paths: [],
    fallback: true,
  };
}
