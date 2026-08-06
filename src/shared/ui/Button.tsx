import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({
  children,
  variant = 'primary',
  className,
  ...rest
}: Props) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ')
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
