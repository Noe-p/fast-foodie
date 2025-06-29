import { FullPageLoader, LayoutPage } from '@/components';
import { AuthWall } from '@/container/components';
import { UpdateDishPage } from '@/container/pages';
import { useDishes } from '@/hooks/useDishes';
import { GetStaticPath, PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type UpdateDishProps = {
  idPage: string;
};

export default function UpdateDish(props: UpdateDishProps): React.JSX.Element {
  const { idPage } = props;
  const { data: dishes = [] } = useDishes();
  const dish = dishes.find((d) => d.id === idPage);

  return (
    <AuthWall>
      <LayoutPage>
        {dish ? <UpdateDishPage dish={dish} /> : <FullPageLoader />}
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
