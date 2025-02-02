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

  useEffect(() => {
    if (user?.userName) {
      setFirstLetter(user.userName.charAt(0).toUpperCase());
    }
  }, [user]);

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
          quality={10}
          width={size}
          height={size}
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

const ImageStyled = tw(Image)`
  bg-white
  rounded-full
  w-full
  h-full
  object-cover
`;
