import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React from 'react';

// Define the props type for TextInput component using 'type'
type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: any;
  className?: string;
};

// Variants using class-variance-authority
const inputVariants = cva(
  'w-full px-3 py-2 border border-t-gray/30 bg-t-black text-white outline-none h-11 placeholder-white/50 focus:border-t-green transition-colors',
);

const TextInput: React.FC<TextInputProps> = ({
  className,
  type = 'text', 
  id,
  error,
  placeholder,
  ...props
}) => {
  return (
    <div>
      <input
        autoComplete="off"
        type={type}
        id={id}
        className={cn(
          inputVariants({ className }),
          type === 'number' && '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]',
          error && 'border-orange-400',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
        placeholder={placeholder || ''}
        {...props}
      />
      {error && <p className="text-orange-400 px-2 pt-2 text-sm">{error}</p>}
    </div>
  );
};

export default TextInput;
