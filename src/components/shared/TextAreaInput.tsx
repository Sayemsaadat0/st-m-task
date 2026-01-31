import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as React from 'react';

// Define variants for the textarea input
const textAreaInputVariants = cva('outline-none bg-inherit py-3 px-4 peer w-full resize-none', {
  variants: {
    variant: {
      primaryInput: 'border border-t-gray/30 bg-t-black text-white placeholder-white/50 focus:border-t-green transition-colors',
      secondaryInput: 'border-b border-b-t-gray/30 bg-t-black text-white placeholder-white/50 focus:border-b-t-green transition-colors',
    },
  },
  defaultVariants: {
    variant: 'primaryInput',
  },
});

// Define the props interface for the TextAreaInput component
export interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'primaryInput' | 'secondaryInput';
  error?: any;
  id?: string;
}

// Define the TextAreaInput component
const TextAreaInput = React.forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  ({ variant, className, error, id, ...props }, ref) => {
    return (
      <div>
        <textarea
          autoComplete="off"
          ref={ref}
          id={id}
          className={cn(
            textAreaInputVariants({ variant, className }),
            error && 'border-orange-400',
            'h-36'
          )}
          {...props}
        />
        {error && <p className="text-orange-400 px-2 pt-2 text-sm">{error}</p>}
      </div>
    );
  },
);

TextAreaInput.displayName = 'TextAreaInput';

export { TextAreaInput };
