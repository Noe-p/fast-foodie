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
      {loading && <Progress value={progress} className="w-1/2" />}
      <ImageStyled
        onLoadStart={() => setProgress(13)}
        onLoad={handleImageLoad}
        style={{ display: loading ? 'none' : 'block', objectFit: "cover" }}
        layout="fill"
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
  background-color: ${({ $isLoading }) => ($isLoading ? 'hsl(var(--background))' : 'transparent')};
  background: ${({ $isLoading }) => 
    $isLoading 
      ? 'hsl(var(--background))'
      : 'transparent'};
  border-radius: 0.5rem;
`;

const ImageStyled = tw(Image)`
  object-cover
  rounded-sm
`;
