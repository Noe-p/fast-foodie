import { FullPageLoader, LayoutPage } from '@/components';
import { AuthWall } from '@/container/components';
import { UpdateDishPage } from '@/container/pages';
import { useDishContext } from '@/contexts';
import { GetStaticPath, PageBaseProps } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type UpdateDishProps = {
  idPage: string;
};

export default function UpdateDish(
  props: UpdateDishProps
): React.JSX.Element {
  const { idPage } = props;
  const { getDishesById } = useDishContext();
  const dish = getDishesById(idPage);
  
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
