import { User } from '@/types';
import Image from 'next/image';
import { LegacyRef, forwardRef, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { P10 } from '../Texts';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: User;
  size?: number;
}

export const Avatar = forwardRef(function (
  props: AvatarProps,
  ref: LegacyRef<HTMLDivElement>
) {
  const { user, size = 25 } = props;
  const [firstLetter, setFirstLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userName) {
      setFirstLetter(user.userName.charAt(0).toUpperCase());
    }
  }, [user]);

  const handleImageLoad = () => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  };

  return (
    <Main
      ref={ref}
      style={{ width: `${size}px`, height: `${size}px` }}
      {...props}
    >
      {user?.profilePicture ? (
        <ImageStyled
          src={user.profilePicture.url}
          alt={user.userName}
          quality={80}
          width={size}
          height={size}
          onLoad={handleImageLoad}
          $isLoaded={!loading}
        />
      ) : (
        <P10
          className='text-white translate-y-0.5'
          style={{ fontSize: `${size / 2}px` }}
        >
          {firstLetter}
        </P10>
      )}
    </Main>
  );
});

const Main = tw.div`
  rounded-full
  overflow-hidden
  flex
  items-center
  justify-center
  bg-primary
  text-secondary
  cursor-pointer
  border
  border-secondary
`;

const ImageStyled = tw(Image)<{ $isLoaded: boolean }>`
  bg-white
  rounded-full
  w-full
  h-full
  object-cover
  object-center
  transition-opacity
  duration-300
  ease-in-out
  ${(props) =>
    props.$isLoaded
      ? 'opacity-100'
      : 'opacity-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'}
`;
