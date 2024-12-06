import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ApiService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useDebounceValue } from 'usehooks-ts';
import { AddressDto, CreateAddressApi } from '@/types';
import { useTranslation } from 'next-i18next';
import { Col, P12 } from '..';
import { ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { cn, formatAddress } from '@/services/utils';

interface InputAddressProps {
  className?: string;
  value?: CreateAddressApi;
  onChange: (value: CreateAddressApi) => void;
}

export function InputAddress(props: InputAddressProps): JSX.Element {
  const { className, value, onChange } = props;
  const { t } = useTranslation();
  const [debouncedSearchValue, setSearchValue] = useDebounceValue('', 500);
  const {
    isPending,
    isError,
    error,
    data: addresses,
  } = useQuery({
    queryKey: ['address', debouncedSearchValue],
    queryFn: () => ApiService.address.searchAutoComplete(debouncedSearchValue),
  });

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'justify-start bg-primary w-full border-background overflow-hidden',
            value ? 'text-background' : 'text-background/80',
            className
          )}
        >
          {value && value.street !== ''
            ? formatAddress(value as AddressDto)
            : t('fields.address.placeholder')}

          <span className='ml-auto'>
            <ChevronsUpDown className='text-background' />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0' align='start'>
        <Input
          icon={<Search className='text-muted' size={20} />}
          className='w-full bg-primary text-background border-background'
          placeholder={t('fields.address.search')}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Col className='p-2 gap-1'>
          {isPending && <Loader2 className='h-6 w-6 animate-spin' />}
          {isError && <P12 className='text-error'>{error.message}</P12>}
          {addresses && addresses.length === 0 && (
            <P12 className='text-left text-background w-full'>
              {t('generics.noResults')}
            </P12>
          )}
          {addresses &&
            addresses.map((address) => (
              <P12
                className='text-left px-2 py-1 text-background rounded cursor-pointer hover:bg-muted/80 w-full'
                key={address.id}
                onClick={() => {
                  setOpen(false);
                  onChange(address);
                }}
              >
                {formatAddress(address)}
              </P12>
            ))}
        </Col>
      </PopoverContent>
    </Popover>
  );
}
