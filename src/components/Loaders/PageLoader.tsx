import tw from 'tailwind-styled-components';
import { InfinitySpin } from 'react-loader-spinner';
import { useState, useEffect } from 'react';

interface PageLoaderProps {
  className?: string;
}

export function PageLoader(props: PageLoaderProps): JSX.Element {
  const { className } = props;
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const delayThreshold = 500;
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, delayThreshold);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Main className={className}>
      {showLoader ? (
        <InfinitySpin width='200' color='hsl(var(--primary))' />
      ) : null}
    </Main>
  );
}

const Main = tw.div`
  flex
  flex-col
  items-center
  justify-center
  h-screen
  w-full
  bg-background
`;
