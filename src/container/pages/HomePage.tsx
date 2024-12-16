import { Layout, Title } from '@/components';
import ImageUpload from '@/components/Inputs/ImageUpload';
import { MediaDto } from '@/types';
import { useTranslation } from 'next-i18next';

export function HomePage(): React.JSX.Element {
  const { t } = useTranslation();
  const onImageUpload = (files: MediaDto[]) => {
    console.log(files);
  }

  return (
    <Layout>
      <Title>{t('home.title')}</Title>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ImageUpload onImageUpload={onImageUpload} />
    </main>
    </Layout>
  );
}
