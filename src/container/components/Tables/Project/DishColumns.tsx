import { P12 } from '@/components';
import { CellText, HeaderText } from '@/components/Table';
import { IMAGE_FALLBACK } from '@/static/constants';
import { MediaDto, User } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { ColumnDef } from '@tanstack/react-table';
import { DishActions } from './DishActions';

export const dishColumns: ColumnDef<Dish>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <HeaderText column={column} i18nKey='table:columns:title' />
    ),
    cell: ({ row }) => <CellText className='font-bold' name='name' row={row} />,
  },
  {
    accessorKey: 'images',
    header: ({ column }) => (
      <HeaderText column={column} i18nKey='table:columns:images' />
    ),
    cell: ({ row }) => {
      const image: MediaDto[] = row.getValue('images') as unknown as MediaDto[];
      return (
        <img
          src={image[0] ? image[0]?.url : IMAGE_FALLBACK}
          alt='dish'
          className='w-10 h-10 object-cover rounded'
        />
      );
    },
  },
  {
    accessorKey: 'chef',
    header: ({ column }) => (
      <HeaderText column={column} i18nKey='table:columns:chef' />
    ),
    cell: ({ row }) => {
      const user: User = row.getValue('chef');
      return <P12>{user.userName}</P12>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DishActions row={row} />,
  },
];
