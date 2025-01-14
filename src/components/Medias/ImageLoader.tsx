import Image, { ImageProps } from 'next/image';
import React, { useState } from 'react';
import { InfinitySpin } from 'react-loader-spinner';
import styled from 'styled-components';

interface ImageLoaderProps extends ImageProps {}

export function ImageLoader(props: ImageLoaderProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
    console.log('[D] ImageLoader', 'handleImageLoad', 'Image loaded');
  };

  return (
    <Container $height={props.height} $width={props.width} $isLoading={loading}>
      {loading ? 
        <div className='-translate-x-3'>
          <InfinitySpin  width='100' color='hsl(var(--primary-foreground))' /> 
        </div>
      :
      <Image
        onLoad={handleImageLoad}
        style={{ display: loading ? 'none' : 'block' }}
        layout="responsive"
        priority={true}
        {...props}
      />
      }
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
  width: ${({ $width }: ContainerProps) => ($width && $width)}px;
  height: ${({ $height }: ContainerProps) => ($height && $height)}px;
  display: flex;
  justify-content: center;
  align-items: center; 
  background-color: ${({ $isLoading }: ContainerProps) => $isLoading ? 'hsl(var(--primary-background))' : 'transparent'};
  border-radius: 0.5rem;
`;