/* eslint-disable indent */

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DrawerDetailDish } from '@/container/components/Drawers';
import { Dish } from '@/types/dto/Dish';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Row } from '..';

interface TableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  redirection?: (id: string) => void;
}

export function Table<TData, TValue>({
  columns,
  data,
  isLoading,
  left,
  right,
  redirection,
}: TableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isOpen, setIsOpen] = useState(false);
  const [dish, setDish] = useState<Dish>();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });
  const { t } = useTranslation();

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div>{left}</div>
        <Row className='gap-1 md:gap-2'>
          {right}
          <DropdownMenu>
            <DropdownMenuTrigger className='hidden md:flex' asChild>
              <Button variant='outline' className='ml-auto'>
                {t('table:filters.columns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {t(`table:columns.${column.id}`)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </Row>
      </div>
      <div className='rounded border border-primary'>
        <BaseTable>
          <TableHeader className=''>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className='bg-primary/20 hover:bg-primary/20 '
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-18 hover:bg-background'
                >
                  <Loader2 className='h-6 w-6 animate-spin' />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const rowOriginal = row.original as any;
                      const dish = rowOriginal as Dish;
                      setDish(dish);
                      setIsOpen(true);
                    }}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className='cursor-pointer' key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24'>
                    {t('generics.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </BaseTable>
      </div>
      <DrawerDetailDish
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        dish={dish}
      />
    </div>
  );
}
