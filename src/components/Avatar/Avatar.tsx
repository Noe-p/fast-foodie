import { User } from '@/types';
import { LegacyRef, forwardRef, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { SafeImage } from '../Medias/SafeImage';
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
        <ImageContainer $isLoaded={!loading}>
          <SafeImage
            src={user.profilePicture.url}
            alt={user.userName}
            quality={80}
            width={size}
            height={size}
            onLoad={handleImageLoad}
            className='bg-white rounded-full w-full h-full object-cover object-center transition-opacity duration-300 ease-in-out'
            style={{
              opacity: !loading ? 1 : 0,
              position: loading ? 'absolute' : 'relative',
              top: loading ? '50%' : 'auto',
              left: loading ? '50%' : 'auto',
              transform: loading ? 'translate(-50%, -50%)' : 'none',
            }}
          />
        </ImageContainer>
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

const ImageContainer = tw.div<{ $isLoaded: boolean }>`
  relative
  w-full
  h-full
`;
