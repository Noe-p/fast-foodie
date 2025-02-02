import * as React from 'react';

import { cn } from '@/services/utils';
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from 'lucide-react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icon?: React.ReactNode;
  isRemovable?: boolean;
  onChange: (v: string) => void;
  iconSize?: number;
  isArrow?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type, isRemovable, onChange, iconSize, isArrow, ...props }, ref) => {
    return (
      <div className={`relative ${type === 'number' && 'flex flex-row gap-2 items-center'}`}>
        {icon && (
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            {icon}
          </div>
        )}
        {
          isArrow && <ChevronLeftCircleIcon size={iconSize ?? 40} className='' onClick={()=> onChange((Number(props.value) -1).toString())} />
        }
        <input
          type={type}
          className={cn(
            'flex h-10 text-primary w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-10' : 'pl-3',
            type === 'number' && 'text-center',
            className
          )}
          onChange={(e) => {
            const value = e.target.value;
            // Si c'est de type 'number', on supprime les espaces
            if (type === 'number') {
              e.target.value = value.replace(/\s/g, ''); // Supprime les espaces
            }
            onChange(e.target.value); // Appelle la fonction onChange passée en prop avec la valeur nettoyée
          }}
          ref={ref}
          {...props}
        />
        {isRemovable && props.value && (
          <button
            type='button'
            className='absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground'
            onClick={() =>
              onChange('')
            }
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
           {
          isArrow && <ChevronRightCircleIcon onClick={()=> onChange((Number(props.value) +1).toString())} size={iconSize ?? 40} />
        }
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
