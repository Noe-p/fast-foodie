import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind-styled-components';
import { Progress } from '../ui/progress';

interface ImageLoaderProps extends ImageProps {}

export function ImageLoader(props: ImageLoaderProps): React.JSX.Element {
  const { width, height, ...rest } = props;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + Math.random() * 10 : 100));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImageLoad = () => {
    setProgress(100);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  };

  return (
    <Container $height={height} $isLoading={loading}>
      <ProgressStyled $isLoading={loading} value={progress} />
      <ImageStyled
        onLoadStart={() => setProgress(13)}
        onLoad={handleImageLoad}
        layout='fill'
        $isLoaded={!loading}
        priority={true}
        {...rest}
      />
    </Container>
  );
}

interface ContainerProps {
  $height?: number | `${number}` | undefined;
  $width?: number | `${number}` | undefined;
  $isLoading?: boolean | undefined;
}

const Container = styled.div<ContainerProps>`
  position: relative;
  width: 100%;
  height: ${({ $height }) => $height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ $isLoading }) =>
    $isLoading ? 'hsl(var(--background))' : 'transparent'};
  background: ${({ $isLoading }) =>
    $isLoading ? 'hsl(var(--background))' : 'transparent'};
  border-radius: 0.5rem;
  transition: background-color 0.3s ease-in-out;
`;

const ImageStyled = tw(Image)<{ $isLoaded: boolean }>`
  object-cover
  rounded-sm
  transition-opacity
  duration-300
  ease-in-out
  object-center
  object-cover
  ${(props) => (props.$isLoaded ? 'opacity-100' : 'opacity-0')}
`;

const ProgressStyled = tw(Progress)<{ $isLoading: boolean }>`
  w-1/2
  transition-opacity
  duration-300
  ease-in-out
  absolute
  top-1/2
  left-1/2
  transform
  -translate-x-1/2
  -translate-y-1/2
  w-1/2
  ${(props) => (props.$isLoading ? 'opacity-100' : 'opacity-0')}
`;
