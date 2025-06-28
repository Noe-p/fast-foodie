import { ImageProps as NextImageProps } from 'next/image';
import React from 'react';
import { SafeImage } from './SafeImage';

interface ImageProps extends Omit<NextImageProps, 'fetchPriority'> {
  // Props spécifiques à notre composant
}

export function Image(props: ImageProps): React.JSX.Element {
  const { className, ...rest } = props;

  return (
    <SafeImage
      {...rest}
      className={`w-full h-full object-cover object-center rounded-lg ${
        className || ''
      }`}
    />
  );
}
