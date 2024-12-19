import { useTranslation } from 'next-i18next';
import { LegacyRef, forwardRef, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { P12 } from '../Texts';
import { useAuthContext } from '@/contexts';


export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
}

export const Avatar = forwardRef(function (
  props: AvatarProps,
  ref: LegacyRef<HTMLDivElement>
) {
  const {
  } = props;
  const { currentUser } = useAuthContext();
  const [ firstLetter, setFirstLetter ] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.userName) {
      const first = currentUser.userName[0];
      setFirstLetter(first.toUpperCase());
    }
  }, [currentUser]);


  return (
    <Main
      ref={ref}
      {...props}
    >
      <P12 className='text-white'>{firstLetter}</P12>
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
  w-7
  h-7
  cursor-pointer
  border
  border-secondary
`;
