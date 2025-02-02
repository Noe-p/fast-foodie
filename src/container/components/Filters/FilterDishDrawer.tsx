import { LocalSearchParams } from '@/types';
import { ListFilter } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Col, H3, Row, RowBetween } from '../../../components';
import { DrawerDialog } from '../../../components/Drawer';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';

interface FilterDishDrawerProps {
  tags: string[];
  chefs: string[];
  filters: LocalSearchParams;
  setFilters: (filters: LocalSearchParams) => void;
}

export function FilterDishDrawer(props: FilterDishDrawerProps): JSX.Element {
  const { chefs, tags, filters, setFilters } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DrawerDialog
      open={open}
      setOpen={setOpen}
      title={t('filters.title')}
      description={t('filters.description')}
      isFooter={false}
      button={
        <Button variant='outline' className='w-fit'>
          <ListFilter className='w-fit' />
        </Button>
      }
    >
      <Col className='gap-4'>
        <RowBetween className='items-center'>
          <H3>{t('filters.chef')}</H3>
          <Button
            variant={'outline'}
            disabled={!filters.chef}
            size='sm'
            onClick={() =>
              setFilters({
                ...filters,
                chef: undefined,
              })
            }
          >
            {t('filters.reset')}
          </Button>
        </RowBetween>
        <Row className='gap-1'>
          {chefs.map((chef) => (
            <Badge
              variant={filters.chef === chef ? 'active' : 'outline'}
              key={chef}
              onClick={() => chef === filters.chef ? setFilters({ ...filters, chef: undefined }) : setFilters({ ...filters, chef })}
            >
              {chef}
            </Badge>
          ))}
        </Row>
      </Col>
      <Separator className='my-8' />
      <Col className='gap-4'>
        <RowBetween className='items-center'>
          <H3>{t('filters.tag')}</H3>
          <Button
            size="sm"
            variant='outline'
            disabled={!filters.tag}
            onClick={() =>
              setFilters({
                ...filters,
                tag: undefined,
              })
            }
          >
            {t('filters.reset')}
          </Button>
        </RowBetween>
        <Row className='gap-1'>
          {tags.length > 0 && tags.map((tag) => (
            <Badge
              variant={filters.tag === tag ? 'active' : 'outline'}
              key={tag} onClick={() => tag === filters.tag ? setFilters({ ...filters, tag: undefined }) : setFilters({ ...filters, tag })}
              >
                {tag}
            </Badge>
          ))}
        </Row>
      </Col>
      <Row className='mt-10 justify-end gap-2 mb-10'>
        <Button onClick={()=> setOpen(false)} variant='default'>{t('generics.save')}</Button>
      </Row>
    </DrawerDialog>
  );
}
