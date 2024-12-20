import { ColCenter, H1, H2, H3, P14 } from '@/components';
import { IMAGE_FALLBACK } from '@/static/constants';
import { Dish } from '@/types/dto/Dish';
import React, { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

interface DishesCardProps {
  className?: string;
  dish: Dish;
}

export function DishesCard(props: DishesCardProps): JSX.Element {
  const { className, dish } = props;

  return <Main className={className}>
    <Image src={dish.images.length > 0 ? dish.images[0]?.url : IMAGE_FALLBACK} alt={dish.name} />
    <H2 className='mt-4' >{dish.name}</H2>
  </Main>;
}

const Main = tw(ColCenter)`
  p-4
  w-full
  lain_background
  rounded-sm
  shadow-md
`;
const Image = tw.img`
  w-full
  h-90
  object-cover
  rounded-sm
`;