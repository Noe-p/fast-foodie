import * as React from 'react';

import { cn } from '@/services/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  isRemovable?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type, isRemovable, ...props }, ref) => {
    return (
      <div className='relative'>
        {icon && (
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 text-primary w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-10' : 'pl-3',
            className
          )}
          ref={ref}
          {...props}
        />
        {isRemovable && props.value && (
          <button
            type='button'
            className='absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground'
            onClick={() =>
              props.onChange?.({
                target: { value: '' },
              } as React.ChangeEvent<HTMLInputElement>)
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
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
