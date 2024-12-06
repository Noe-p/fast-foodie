import { Layout, Title } from '@/components';
import { useTranslation } from 'next-i18next';

export function HomePage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Layout>
      <Title>{t('home.title')}</Title>
    </Layout>
  );
}
