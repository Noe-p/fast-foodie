import { ReactNode, useState } from 'react';
import { DrawerDialog } from '../Drawer';
import { ArrowUpNarrowWide, ListFilter } from 'lucide-react';
import { Col, H3, RowBetween } from '..';
import { useTranslation } from 'next-i18next';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { cn } from '@/services/utils';
import { useAppContext } from '@/contexts';

interface FilterDrawerProps {
  children?: ReactNode;
  orderBy?: {
    id: string;
    label: string;
  }[];
}

export function FilterDrawer(props: FilterDrawerProps): JSX.Element {
  const { children, orderBy } = props;
  const { t } = useTranslation();
  const { searchParams, setSearchParams } = useAppContext();
  const [open, setOpen] = useState(false);

  return (
    <DrawerDialog
      open={open}
      setOpen={setOpen}
      title={t('table:filters.title')}
      description={t('table:filters.description')}
      button={
        <Button variant='outline'>
          <ListFilter />
        </Button>
      }
    >
      <Col className='gap-4'>
        <RowBetween className='items-center'>
          <H3>{t('table:filters.orderBy')}</H3>
          <Button
            variant='ghost'
            onClick={() => {
              setSearchParams({
                ...searchParams,
                orderType: searchParams.orderType === 'ASC' ? 'DESC' : 'ASC',
                page: 0,
              });
            }}
          >
            <ArrowUpNarrowWide
              className={cn(
                'w-5 h-5',
                searchParams.orderType === 'ASC' && 'rotate-180'
              )}
            />
          </Button>
        </RowBetween>
        <RadioGroup
          onValueChange={(v) =>
            setSearchParams({
              ...searchParams,
              orderBy: v as string | undefined,
            })
          }
          className='grid gap-2 w-full grid-cols-2'
          defaultValue={searchParams.orderBy}
        >
          {orderBy?.map((order) => (
            <div key={order.id} className='flex items-center space-x-2'>
              <RadioGroupItem value={order.id} id={order.id} />
              <Label htmlFor={order.id}>{order.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Col>
      {children && <Separator className='my-8' />}
      {children}
    </DrawerDialog>
  );
}
