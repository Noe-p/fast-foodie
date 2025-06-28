import NextImage, { ImageProps as NextImageProps } from 'next/image';
import React from 'react';

// Composant wrapper qui filtre fetchPriority
export const SafeImage = React.forwardRef<HTMLImageElement, NextImageProps>(
  ({ fetchPriority, ...props }, ref) => {
    return <NextImage ref={ref} {...props} />;
  }
);
SafeImage.displayName = 'SafeImage';
