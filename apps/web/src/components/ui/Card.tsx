import React from 'react';

import {
  clsx,
  type ClassValue,
} from 'clsx';

import {
  twMerge,
} from 'tailwind-merge';

export function cn(
  ...inputs: ClassValue[]
) {

  return twMerge(

    clsx(...inputs),

  );

}

type CardProps<
  T extends React.ElementType
> = {

  as?: T;

  children: React.ReactNode;

} & React.ComponentPropsWithoutRef<T>;

export default function Card<
  T extends React.ElementType = 'div'
>({
  as,
  children,
  className,
  ...props
}: CardProps<T>) {

  const Component =
    as || 'div';

  return (

    <Component

      className={cn(

        `
        relative
        overflow-hidden

        rounded-2xl

        bg-white

        border
        border-slate-200

        p-6

        shadow-sm

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-xl
        hover:border-teal-300

        active:scale-[0.99]

        before:absolute
        before:top-0
        before:left-0
        before:w-full
        before:h-1
        before:bg-gradient-to-r
        before:from-teal-600
        before:via-cyan-500
        before:to-emerald-500
        `,

        className,

      )}

      {...props}

    >

      {children}

    </Component>

  );

}