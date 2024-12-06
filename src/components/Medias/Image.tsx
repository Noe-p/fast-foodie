import React from 'react';
import tw from 'tailwind-styled-components';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function Image(props: ImageProps): React.JSX.Element {
  const { className } = props;

  return <ImageStyled {...props} className={className} />;
}

const ImageStyled = tw.img`
  w-full
  h-full
  object-cover
  object-center
  rounded-lg
`;
