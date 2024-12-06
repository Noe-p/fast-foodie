import * as React from 'react';

import { cn } from '@/services/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isRemovable?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isRemovable, ...props }, ref) => {
    return (
      <div className='relative'>
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {isRemovable && props.value && (
          <button
            type='button'
            className='absolute top-2 right-2 flex items-center  text-muted-foreground'
            onClick={() =>
              props.onChange?.({
                target: { value: '' },
              } as React.ChangeEvent<HTMLTextAreaElement>)
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
Textarea.displayName = 'Textarea';

export { Textarea };
