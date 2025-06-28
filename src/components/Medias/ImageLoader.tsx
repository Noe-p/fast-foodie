import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { Progress } from '../ui/progress';

interface ImageLoaderProps
  extends Omit<ImageProps, 'onLoad' | 'onError' | 'width' | 'height' | 'src'> {
  width: number;
  height: number;
  src: string;
  fallbackSrc?: string;
  showProgress?: boolean;
  onLoadComplete?: () => void;
  onError?: () => void;
  overlayClassName?: string;
}

export function ImageLoader(props: ImageLoaderProps): React.JSX.Element {
  const {
    width,
    height,
    fallbackSrc = '/images/image-fallback.jpg',
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
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [showLoader, setShowLoader] = useState(false);

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
    }
    return () => clearInterval(interval);
  }, [loading, showProgress]);

  const handleImageLoad = () => {
    setProgress(100);
    setLoading(false);
    setHasError(false);
    onLoadComplete?.();
  };

  const handleImageError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setProgress(0);
      setLoading(true);
      setHasError(false);
    } else {
      setLoading(false);
      setHasError(true);
      onError?.();
    }
  };

  const handleImageStart = () => {
    setLoading(true);
    setProgress(0);
    setHasError(false);
  };

  return (
    <Container $height={height} $width={width} $isLoading={loading}>
      {loading && showProgress && showLoader && (
        <LoadingOverlay className={overlayClassName}>
          <ProgressContainer>
            <Progress value={progress} className='w-full h-2' />
          </ProgressContainer>
        </LoadingOverlay>
      )}

      {hasError && (
        <ErrorOverlay>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>Erreur de chargement</ErrorText>
        </ErrorOverlay>
      )}

      <ImageStyled
        width={width || 800}
        height={height || 600}
        onLoadStart={handleImageStart}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={className}
        $isLoaded={!loading && !hasError}
        priority={props.priority}
        quality={props.quality || 90}
        src={currentSrc}
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
  z-10
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

const ErrorOverlay = tw.div`
  absolute
  inset-0
  flex
  flex-col
  items-center
  justify-center
  bg-red-50
  dark:bg-red-900/20
  z-10
`;

const ErrorIcon = tw.div`
  text-2xl
  mb-2
`;

const ErrorText = tw.span`
  text-sm
  font-medium
  text-red-600
  dark:text-red-400
`;
