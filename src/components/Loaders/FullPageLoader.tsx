import { Layout, PageLoader } from '@/components';

interface LoaderProps {
  className?: string;
}

export function FullPageLoader(props: LoaderProps): React.JSX.Element {
  const { className } = props;

  return (
    <Layout className={`justify-center items-center ${className}`}>
      <PageLoader className='h-full' />
    </Layout>
  );
}
