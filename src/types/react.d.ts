import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    onSubmit?: FormEventHandler<T>;
    onChange?: ChangeEventHandler<T>;
    htmlFor?: string;
  }

  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number | readonly string[];
  }
} 