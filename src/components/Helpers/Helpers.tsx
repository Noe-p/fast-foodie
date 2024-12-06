import tw from 'tailwind-styled-components';

export const Grid1 = tw.div`
  grid grid-cols-1 gap-y-5 md:gap-5 w-full
`;

export const Grid2 = tw.div`
  grid md:grid-cols-2 grid-cols-1 gap-y-5  md:gap-5 w-full
`;

export const Grid3 = tw.div`
  grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-3 md:gap-3 w-full
`;

export const GridCol1 = tw.div`
  col-span-1
`;

export const GridCol2 = tw.div`
  col-span-2
`;

export const GridCol3 = tw.div`
  col-span-3
`;

export const Flex = tw.div`
  flex
`;

export const Col = tw(Flex)`
  flex-col
`;

export const ColCenter = tw(Col)`
  items-center
  w-full
`;

export const ColJustifyCenter = tw(Col)`
  justify-center
  h-full
`;

export const Row = tw(Flex)`
  flex-row
`;

export const RowCenter = tw(Row)`
  items-center
`;

export const RowBetween = tw(Row)`
  justify-between
`;
