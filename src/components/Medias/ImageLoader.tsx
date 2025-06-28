import { IMAGE_FALLBACK } from '@/static/constants';
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { Progress } from '../ui/progress';

interface ImageLoaderProps
  extends Omit<ImageProps, 'onLoad' | 'onError' | 'width' | 'height' | 'src'> {
  width: number;
  height: number;
  src: string;
  showProgress?: boolean;
  onLoadComplete?: () => void;
  onError?: () => void;
  overlayClassName?: string;
}

export function ImageLoader(props: ImageLoaderProps): React.JSX.Element {
  const {
    width,
    height,
    showProgress = true,
    onLoadComplete,
    onError,
    className,
    overlayClassName,
    src,
    fetchPriority,
    ...rest
  } = props;

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [showLoader, setShowLoader] = useState(false);

  // Reset des états quand src change
  useEffect(() => {
    setLoading(true);
    setProgress(0);
    setCurrentSrc(src);
  }, [src]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && showProgress) {
      timer = setTimeout(() => setShowLoader(true), 150);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [loading, showProgress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && showProgress) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // S'arrêter à 90% jusqu'au vrai chargement
          return prev + Math.random() * 15;
        });
      }, 200);
    } else {
      // Reset de la progression si les conditions ne sont pas remplies
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading, showProgress]);

  const handleImageLoad = () => {
    setProgress(100);
    setLoading(false);
    onLoadComplete?.();
  };

  const handleImageError = () => {
    setLoading(false);
    onError?.();
  };

  const handleImageStart = () => {
    setLoading(true);
    setProgress(0);
  };

  return (
    <Container $height={height} $width={width} $isLoading={loading || false}>
      {loading && showProgress && showLoader && (
        <LoadingOverlay className={overlayClassName}>
          <ProgressContainer>
            <Progress value={progress} className='w-full h-2' />
          </ProgressContainer>
        </LoadingOverlay>
      )}

      <ImageStyled
        width={width || 800}
        height={height || 600}
        onLoadStart={handleImageStart}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={className}
        $isLoaded={!loading}
        priority={props.priority}
        quality={props.quality || 90}
        src={currentSrc || IMAGE_FALLBACK}
        {...rest}
      />
    </Container>
  );
}

interface ContainerProps {
  $height?: number | string;
  $width?: number | string;
  $isLoading?: boolean;
}

const Container = tw.div<ContainerProps>`
  relative
  flex
  justify-center
  items-center
  bg-gray-100
  dark:bg-gray-800
  rounded-lg
  overflow-hidden
  transition-all
  duration-300
  ease-in-out
  aspect-[3/4]
  w-full
  max-w-xs
  mx-auto
`;

const ImageStyled = tw(Image)<{ $isLoaded: boolean }>`
  transition-all
  duration-300
  ease-in-out
  object-cover
  w-full
  h-full
  ${(props) =>
    props.$isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
`;

const LoadingOverlay = tw.div`
  absolute
  inset-0
  flex
  items-center
  justify-center
  z-5
  bg-background
`;

const ProgressContainer = tw.div`
  flex
  flex-col
  items-center
  gap-2
  w-1/2
  max-w-xs
`;
